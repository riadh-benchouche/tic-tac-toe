<script setup>
import {computed, onMounted, reactive, ref} from 'vue';
import FullLayout from '@/layouts/FullLayout.vue';
import {CubeIcon, UserCircleIcon} from '@heroicons/vue/24/outline';
import {userStore} from "@/store/UserStore";

const secondaryNavigation = ref([
  {name: 'History', href: '#', icon: CubeIcon, current: true},
  {name: 'Profile', href: '#', icon: UserCircleIcon, current: false},
]);

const useUser = userStore();

const state = reactive({
  games: [],
  users: [],
})

onMounted(
    async () => {
      const response = await fetch('http://localhost:3000/games/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') || '',
        },
      });
      if (response.ok) {
        state.games = await response.json();
      } else {
        console.error(response);
      }
    }
)

const handleTabChange = (item) => {
  secondaryNavigation.value.forEach((navItem) => {
    navItem.current = navItem.name === item.name;
  });
};

const currentTabContent = computed(() => {
  const currentTab = secondaryNavigation.value.find(item => item.current);
  return currentTab ? currentTab.name : '';
});

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}
</script>

<template>
  <FullLayout>
    <div class="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16 lg:px-8">
      <h1 class="sr-only">General Settings</h1>
      <aside
          class="flex overflow-x-auto border-b border-gray-100/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
        <nav class="flex-none px-4 sm:px-6 lg:px-0">
          <ul role="list" class="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
            <li v-for="item in secondaryNavigation" :key="item.name">
              <a :href="item.href"
                 @click="handleTabChange(item)"
                 :class="[item.current ? 'bg-gray-100 text-indigo-600' : 'text-gray-100 hover:bg-gray-50 hover:text-indigo-600', 'group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm font-semibold leading-6']">
                <component :is="item.icon"
                           :class="[item.current ? 'text-indigo-600' : 'text-gray-100 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']"
                           aria-hidden="true"/>
                {{ item.name }}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <div class="px-4 py-16 sm:px-6 lg:flex-auto lg:px-4 lg:py-20">
        <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
          <!-- History Tab Content -->
          <div v-if="currentTabContent === 'History'">
            <h2 class="text-base font-semibold leading-7 text-gray-200">History</h2>
            <p class="mt-1 text-sm leading-6 text-gray-300">This is the history tab content.</p>
            <div class="bg-gray-800">
              <div class="mx-auto">
                <div class="bg-gray-800 ">
                  <div class="">
                    <div class="mt-8 flow-root">
                      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                          <table class="min-w-full divide-y divide-gray-700">
                            <thead>
                            <tr>
                              <th scope="col"
                                  class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Room
                              </th>
                              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Date</th>
                              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Players
                              </th>
                              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Result</th>
                            </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-800 ">
                            <tr v-for="game in state.games" :key="game._id"
                                :class="[game.winner === useUser.user._id ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-600', 'p-4 rounded-md']">
                              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                                {{ game.roomCode }}
                              </td>
                              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                {{ formatDate(game.createdAt) }}
                              </td>
                              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              <span v-for="(user, index) in game.players" :key="index">
                                {{ user.username }} {{ index < game.players.length - 1 ? ', ' : '' }}
                              </span>
                              </td>
                              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                <span v-if="game.winner !== useUser.user._id"
                                      class="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Lose</span>
                                <span v-else
                                      class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Win</span>
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Profile Tab Content -->
          <div v-if="currentTabContent === 'Profile'">
            <h2 class="text-base font-semibold leading-7 text-gray-200">Profile</h2>
            <p class="mt-1 text-sm leading-6 text-gray-300">Manage your account settings.</p>

            <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
              <div class="pt-6 sm:flex">
                <dt class="font-medium text-gray-200 sm:w-64 sm:flex-none sm:pr-6">Full name</dt>
                <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div class="text-gray-200">Tom Cook</div>
                  <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">Update</button>
                </dd>
              </div>
              <div class="pt-6 sm:flex">
                <dt class="font-medium text-gray-200 sm:w-64 sm:flex-none sm:pr-6">Email address</dt>
                <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div class="text-gray-200">tom.cook@example.com</div>
                  <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">Update</button>
                </dd>
              </div>
              <div class="pt-6 sm:flex">
                <dt class="font-medium text-gray-200 sm:w-64 sm:flex-none sm:pr-6">Password</dt>
                <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div class="text-gray-200">*********</div>
                  <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">Update</button>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </FullLayout>
</template>
