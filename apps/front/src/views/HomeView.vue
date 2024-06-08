<script setup lang="ts">
import {reactive, ref} from 'vue'
import FullLayout from "@/layouts/FullLayout.vue";
import {Dialog, DialogDescription, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from '@headlessui/vue'
import {useRouter} from "vue-router";
import {io} from 'socket.io-client';

const socket = io('http://localhost:9005');

const open = ref(false)
const openConfirmation = ref(false)
const router = useRouter()
const state = reactive({
  partyCode: '',
  error: '',
});

const joinParty = () => {
  fetch('http://localhost:3000/room/join/' + state.partyCode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token') || '',
    },
    body: JSON.stringify(state),
  }).then(response => {
    if (response.ok) {
      response.json().then(async data => {
        open.value = false;
        await router.push('/game/' + data.room.roomCode);

        socket.emit('userJoinedGame', { room: data.room.roomCode, user: data.user });
      });
    } else {
      response.json().then(data => {
        state.error = 'An error occurred while joining the party.';
        console.error(data)
      });
    }
  });
}

const createParty = () => {
  fetch('http://localhost:3000/room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token') || '',
    },
  }).then(response => {
    if (response.ok) {
      response.json().then(async data => {
        openConfirmation.value = false;
        await router.push('/game/' + data.room.roomCode);
      });
    } else {
      response.json().then(data => {
        console.error(data)
      });
    }
  });
}

const joinOrCreateParty = async (type: string) => {
  if (localStorage.getItem('token') === null) {
    return await router.push({name: 'login'});
  }
  if (type === 'join') {
    open.value = true;
  }
  if (type === 'create') {
    openConfirmation.value = true;
  }
}
</script>
<template>
  <TransitionRoot as="template" :show="openConfirmation">
    <Dialog class="relative z-10" @close="openConfirmation = false">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                       leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
                           enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                           enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                           leave-from="opacity-100 translate-y-0 sm:scale-100"
                           leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">Create party
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">Are you sure you want to create a party?</p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6 flex flex-1 space-x-2">
                <button type="button"
                        @click="createParty"
                        class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Create party
                </button>
                <button type="button"
                        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        @click="openConfirmation = false">Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-10" @close="open = false">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                       leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
                           enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                           enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                           leave-from="opacity-100 translate-y-0 sm:scale-100"
                           leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">Join Party</DialogTitle>
                  <div v-if="state.error !== ''" class="mt-2">
                    <p class="text-sm text-red-500">{{ state.error }}</p>
                  </div>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">Please enter the party code to join the party.</p>
                  </div>
                  <DialogDescription class="mt-4">
                    <label for="party-code" class="block text-sm font-medium text-gray-700">Party Code</label>
                    <div class="mt-1">
                      <input v-model="state.partyCode" id="party-code" name="party-code" type="text" autocomplete="off"
                             required
                             class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                    </div>
                  </DialogDescription>
                </div>
              </div>
              <div class="mt-5 sm:mt-6 flex flex-1 space-x-2">
                <button type="button"
                        :disabled="!state.partyCode"
                        @click="joinParty"
                        class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Join Party
                </button>
                <button type="button"
                        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        @click="open = false">Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
  <FullLayout>
    <div class="bg-white h-full">
      <div class="mx-auto lg:grid lg:grid-cols-2 h-full">
        <div class="relative lg:col-span-1 group">
          <img class="aspect-[3/2] w-full bg-gray-50 object-cover lg:aspect-auto lg:h-full"
               src="https://images.unsplash.com/photo-1668901382969-8c73e450a1f5?q=80&w=2958&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
               alt="Photo à gauche"/>
          <button type="button"
                  @click="joinOrCreateParty('join')"
                  class="absolute inset-0 flex items-center justify-center w-full h-full bg-gray-900/40 group-hover:bg-gray-900/20 text-white font-semibold text-2xl cursor-pointer transition-all duration-300 ease-in-out group-hover:opacity-100">
            <span class="text-5xl font-bold text-white">
              Join Party
            </span>
          </button>
        </div>
        <div class="relative lg:col-span-1 group">
          <img class="aspect-[3/2] w-full bg-gray-50 object-cover lg:aspect-auto lg:h-full"
               src="https://images.unsplash.com/photo-1570303345338-e1f0eddf4946?q=80&w=5142&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
               alt="Photo à droite"/>
          <button type="button"
                  @click="joinOrCreateParty('create')"
                  class="absolute inset-0 flex items-center justify-center w-full h-full bg-gray-900/40 group-hover:bg-gray-900/20 text-white font-semibold text-2xl cursor-pointer transition-all duration-300 ease-in-out group-hover:opacity-100">
            <span class="text-5xl font-bold text-white">
              Create Party
            </span>
          </button>
        </div>
      </div>
    </div>
  </FullLayout>
</template>
