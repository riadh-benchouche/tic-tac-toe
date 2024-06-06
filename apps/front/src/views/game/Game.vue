<script setup>
import {ref, onMounted, reactive} from 'vue';
import {io} from 'socket.io-client';
import FullLayout from "@/layouts/FullLayout.vue";
import {userStore} from "@/store/UserStore";

const board = ref(Array(9).fill(null));
const currentPlayer = ref('X');
const winner = ref(null);
const isDraw = ref(false);
const winningCombination = ref([]);
const messages = ref([]);
const newMessage = ref('');
const useUser = userStore();

const state = reactive({
  users: [],
});

const socket = io('http://localhost:3000');

onMounted(() => {
  socket.emit("connectedUser", useUser.user);
  socket.on("usersLogged", (users) => {
    state.users = users;
  });
});

const makeMove = (index) => {
  if (!board.value[index] && !winner.value) {
    board.value[index] = currentPlayer.value;
    socket.emit('makeMove', {index, player: currentPlayer.value});
    if (checkWin()) {
      winner.value = currentPlayer.value;
      sendMessage(`Hooray! ${currentPlayer.value} wins!`);
    } else if (board.value.every(cell => cell)) {
      isDraw.value = true;
      sendMessage(`It's a draw!`);
    } else {
      currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';
    }
  }
};

const checkWin = () => {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
      winningCombination.value = combination;
      return true;
    }
  }
  return false;
};

const resetGame = () => {
  board.value = Array(9).fill(null);
  currentPlayer.value = 'X';
  winner.value = null;
  isDraw.value = false;
  winningCombination.value = [];
  socket.emit('resetGame');
};

const sendMessage = (message) => {
  if (message) {
    messages.value.push({text: message, isBot: false});
    newMessage.value = '';
    socket.emit('chatMessage', {text: message, isBot: false});
  }
};
</script>

<template>
  <FullLayout>
    <div class="max-w-7xl mx-auto p-4 mt-20">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Tic Tac Toe Section -->
        <div class=" flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-md ring-1 ring-gray-900/5">
          <div class="p-4">
            <div class="flex flex-col items-start bg-gray-100 px-4 py-2.5 rounded-3xl">
              <h3 class="text-lg font-semibold text-gray-900">Tic Tac Toe</h3>
              <p class="text-gray-500">Play with your friend</p>
            </div>
          </div>
          <div class="py-2 flex flex-1 w-full justify-center space-x-2">
            <div class="flex flex-col items-start bg-indigo-200 px-6 py-2 rounded-3xl">
              <h3 class="text-lg font-semibold text-indigo-700">User 1</h3>
              <p class="text-indigo-500">{{ state.users?.[0]?.user.username }}</p>
            </div>
            <div class="flex flex-col items-start bg-pink-200 px-6 py-2 rounded-3xl">
              <h3 class="text-lg font-semibold text-pink-700">User 2</h3>
              <p class="text-pink-500">{{ state.users?.[1]?.user.username }}</p>
            </div>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-3 gap-2 w-full justify-items-center">
              <div
                  v-for="(cell, index) in board"
                  :key="index"
                  :class="['w-24 h-24 flex items-center justify-center border rounded-lg text-3xl font-bold cursor-pointer', cell === 'X' ? 'text-indigo-500' : 'text-pink-500', winningCombination.includes(index) ? 'bg-yellow-200' : '']"
                  @click="makeMove(index)"
              >
                {{ cell }}
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="mt-4">
              <p v-if="winner" class="text-lg font-semibold text-green-500">
                🎉 {{ winner }} wins! 🎉
              </p>
              <p v-else-if="isDraw" class="text-lg font-semibold text-red-500">
                🤝 It's a draw! 🤝
              </p>
              <button type="submit"
                      @click="resetGame"
                      class="rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600 transition-transform transform hover:scale-105">
                Restart Game
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block ml-1" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 10l9-9m0 0l9 9m-9-9v18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Room Section -->
        <div class="pb-2 flex">
          <div
              class=" flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-md ring-1 ring-gray-900/5">
            <div class="p-4">
              <div class="flex flex-col items-start bg-gray-100 px-4 py-2.5 rounded-3xl">
                <h3 class="text-lg font-semibold text-gray-900">Chat with us</h3>
                <p class="text-gray-500">We're here to help</p>
              </div>
              <div
                  class="h-full min-h-[500px] overflow-y-auto p-4 space-y-3 border-[1px] my-4 border-gray-200 rounded-3xl">
                <div v-for="(message, index) in messages" :key="index" class="flex flex-col space-x-3">
                  <div v-if="message.isBot" class="flex items-center space-x-3">
                    <div class="bg-primary-400 p-0.5 rounded-full">
                      <img alt="Bot" class="w-10 h-10"/>
                    </div>
                    <div class="bg-gray-100 px-4 py-2.5 rounded-3xl w-full max-w-[300px]">
                      <p class="text-gray-900">{{ message.text }}</p>
                    </div>
                  </div>
                  <div v-else class="flex items-center space-x-3 justify-end">
                    <div class="bg-secondary-600 text-end px-4 py-2.5 rounded-3xl text-white w-fit max-w-[300px]">
                      <p>{{ message.text }}</p>
                    </div>
                    <div class="bg-secondary-400 p-1 rounded-full">
                      <img alt="User" class="w-10 h-10"/>
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

<style scoped>
.bg-primary-400 {
  background-color: #4f46e5;
}

.bg-secondary-400 {
  background-color: #3b82f6;
}

.bg-secondary-500 {
  background-color: #2563eb;
}

.bg-secondary-600 {
  background-color: #1d4ed8;
}
</style>
