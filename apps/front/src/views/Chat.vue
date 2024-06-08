<script setup lang="ts">
import FullLayout from "@/layouts/FullLayout.vue";
import {onMounted, onUnmounted, reactive, ref} from "vue";
import {io} from "socket.io-client";
import {userStore} from "@/store/UserStore";

const newMessage = ref('');
const useUser = userStore();
const socket = io('http://localhost:9005');

const state = reactive({
  messages: [],
});
const getMessages = () => {
  fetch('http://localhost:3000/messages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token') || '',
    },
  }).then(response => {
    if (response.ok) {
      response.json().then(data => {
        state.messages = data;
      });
    } else {
      response.json().then(data => {
        console.error(data)
      });
    }
  });
}

onMounted(() => {
  getMessages()
  socket.on('newMessage', (message) => {
    state.messages.push(message);
  });
});

onUnmounted(() => {
  socket.disconnect();
});

const sendMessage = () => {
  socket.emit('sendMessage', {
    sender: useUser.user._id,
    content: newMessage.value,
    isInRoom: false,
    roomCode: null,
  });
  newMessage.value = '';
};

</script>

<template>
  <FullLayout>
    <div class="relative isolate overflow-hidden bg-gray-900 h-screen">
      <svg
          class="absolute inset-0 -z-10 h-screen w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true">
        <defs>
          <pattern id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc" width="200" height="200" x="50%" y="-1"
                   patternUnits="userSpaceOnUse">
            <path d="M.5 200V.5H200" fill="none"/>
          </pattern>
        </defs>
        <svg x="50%" y="-1" class="overflow-visible fill-gray-800/20">
          <path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                stroke-width="0"/>
        </svg>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"/>
      </svg>
      <div
          class="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
          aria-hidden="true">
        <div class="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
             style="clip-path: polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)"/>
      </div>
      <div class="mx-auto px-6 pb-24 pt-40 sm:pb-32 lg:flex lg:px-8 lg:py-40 w-full">
        <div class="pb-2 flex w-full">
          <div
              class=" flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-md ring-1 ring-gray-900/5">
            <div class="p-4">
              <div class="flex flex-col items-start bg-gray-100 px-4 py-2.5 rounded-3xl">
                <h3 class="text-lg font-semibold text-gray-900">Chat with us</h3>
                <p class="text-gray-500">Enjoy our chat with friends</p>
              </div>
              <div
                  class="h-full max-h-[500px] overflow-y-auto p-4 space-y-3 border-[1px] my-4 border-gray-200 rounded-3xl">
                <div v-for="(message, index) in state.messages" :key="index" class="flex flex-col space-x-3">
                  <div v-if="message.sender?._id !== useUser.user._id" class="flex items-center space-x-3">
                    <div class="bg-gray-200 p-1 rounded-full">
                      <img src="/user-1.webp" alt="Bot" class="w-10 h-10 mt-1"/>
                    </div>
                    <div class="bg-gray-100 px-4 py-2.5 rounded-3xl w-fit max-w-[300px]">
                      <p class="text-gray-900">{{ message?.content }}</p>
                    </div>
                  </div>
                  <div v-else class="flex items-center space-x-3 justify-end">
                    <div class="bg-indigo-600 text-end px-4 py-2.5 rounded-3xl text-white w-fit max-w-[300px]">
                      <p>{{ message?.content }}</p>
                    </div>
                    <div class="bg-secondary-400 p-1 rounded-full">
                      <img src="/user-2.webp" alt="User" class="w-10 h-10"/>
                    </div>
                  </div>
                </div>
              </div>
              <form class="mt-4" @submit.prevent="sendMessage">
                <div class="flex items-center space-x-3">
                  <input type="text" v-model="newMessage"
                         class="flex-1 px-2 py-2 block w-full rounded-full border-gray-200 border-[1px] focus:ring-0 focus:outline-none"
                         placeholder="Type your message"/>
                  <button type="submit"
                          class="rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600 transition-transform transform hover:scale-105">
                    Send
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block ml-1" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10l9-9m0 0l9 9m-9-9v18"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullLayout>
</template>
