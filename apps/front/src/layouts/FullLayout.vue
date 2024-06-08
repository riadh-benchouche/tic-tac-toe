<script setup>
import {ref} from 'vue'
import {Dialog, DialogPanel} from '@headlessui/vue'
import {Bars3Icon, XMarkIcon, UserIcon} from '@heroicons/vue/24/outline'
import {userStore} from "@/store/UserStore";

const mobileMenuOpen = ref(false)

const useUser = userStore();

const logout = () => {
    try {
        localStorage.removeItem('token'); 
        window.location.href = '/login';
    } catch (error) {
        console.error('An error occurred during logout:', error);
    }
};

</script>

<template>
  <div>
    <header class="absolute inset-x-0 top-0 z-50 max-w-7xl ml-auto mr-auto">
      <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Your Company</span>
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
          </a>
        </div>
        <div class="flex lg:hidden">
          <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
                  @click="mobileMenuOpen = true">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon class="h-6 w-6" aria-hidden="true"/>
          </button>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end">
          <a v-if="useUser.getToken === ''"
            href="/login" class="text-sm font-semibold leading-6 text-white">Log in <span
              aria-hidden="true">&rarr;</span></a>
          <template v-else>
            <a href="/profile" class="text-sm font-semibold leading-6 text-white">
              <userIcon class="h-6 w-6 inline-block" aria-hidden="true"/>
            </a>
            <a @click="logout" class="text-sm font-semibold leading-6 text-white cursor-pointer ml-4">Log out</a>
          </template>
        </div>

      </nav>
      <Dialog class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
        <div class="fixed inset-0 z-50"/>
        <DialogPanel
            class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div class="flex items-center justify-between">
            <a href="#" class="-m-1.5 p-1.5">
              <span class="sr-only">Your Company</span>
              <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
            </a>
            <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = false">
              <span class="sr-only">Close menu</span>
              <XMarkIcon class="h-6 w-6" aria-hidden="true"/>
            </button>
          </div>
          <div class="mt-6 flow-root">
            <div class="-my-6 divide-y divide-gray-500/10">
                  <a v-if="useUser.getToken === ''"
                href="/login" class="text-sm font-semibold leading-6 text-dark-800">Log in <span
                  aria-hidden="true">&rarr;</span></a>
              <div v-else class="mt-5 flex flex-col space-y-2">
                <a href="/profile" class="text-sm font-semibold leading-6 text-dark-800">
                  Profile
                </a>
                <a @click="logout" class="text-sm font-semibold leading-6 text-dark-800 cursor-pointer">Log out</a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
    <main class="h-screen bg-gray-800">
      <slot/>
    </main>
  </div>
</template>
