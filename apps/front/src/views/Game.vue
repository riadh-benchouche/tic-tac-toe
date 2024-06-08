<script setup>
import {ref, onMounted, reactive, onUnmounted, nextTick, watch} from 'vue';
import {io} from 'socket.io-client';
import FullLayout from "@/layouts/FullLayout.vue";
import {userStore} from "@/store/UserStore";
import {useRouter} from "vue-router";

const winningCombination = ref([]);
const newMessage = ref('');
const useUser = userStore();
const router = useRouter();
const board = ref(Array(9).fill(null))

const state = reactive({
  users: [],
  messages: [],
  board: [],
  isFinished: false,
  winner: null,
});

const socket = io('http://localhost:9005');

socket.on('userJoinedGame', ({ room, user }) => {
  if (room === router.currentRoute.value.params.id) {
    state.users.push(user);
  }
});


const getCurrentRoom = () => {
  const roomCode = router.currentRoute.value.params.id;
  fetch('http://localhost:3000/room/getCurrentRoom/' + roomCode, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token') || '',
    },
  }).then(response => {
    if (response.ok) {
      response.json().then(data => {
        state.users = data.room.players;
        state.board = data.room.board
      });
    } else {
      response.json().then(data => {
        console.error(data)
      });
    }
  });
}

const getMessages = () => {
  const roomCode = router.currentRoute.value.params.id;
  fetch('http://localhost:3000/messages/room/' + roomCode, {
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
  getCurrentRoom();
  getMessages();
  socket.on('newMessage', (message) => {
    state.messages.push(message);
  });

  socket.on('playerPlayed', (data) => {
    state.board = data.room.board
  });

  socket.on('restartGame', (data) => {
    state.board = data.room.board
  });

  socket.on('gameFinished', ({ roomCode, winner }) => {
    if (roomCode === router.currentRoute.value.params.id) {
      state.isFinished = true;
      state.winner = winner;
    }
  });

});

onUnmounted(() => {
  socket.disconnect();
});
const sendMessage = () => {
  socket.emit('sendMessage', {
    sender: useUser.user._id,
    content: newMessage.value,
    isInRoom: true,
    roomCode: router.currentRoute.value.params.id,
  });
  newMessage.value = '';
};

const makeMove = (row, col) => {
  socket.emit('playerPlayed', {
    roomCode: router.currentRoute.value.params.id,
    userId: useUser.user._id,
    row,
    col
  })
};

const resetGame = () => {
  socket.emit('restartGame', {
    roomCode: router.currentRoute.value.params.id,
  })
};

const messageContainer = ref < HTMLElement | null > null;

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
};

watch(() => state.messages, () => {
  scrollToBottom();
}, {immediate: true, deep: true});
</script>

<template>
  <FullLayout>
    <div v-if="state.isFinished" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
      <div class="bg-white p-4 rounded-3xl shadow-lg">
          <div class="flex flex-col items-center space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Game Over</h3>
            <p class="text-gray-500">Winner is {{ state.winner }}</p>
            <button type="button"
                    @click="() => router.push('/')"
                    class="rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600 transition-transform transform hover:scale-105">
              Go Back
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline-block ml-1" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 10l9-9m0 0l9 9m-9-9v18"/>
              </svg>
            </button>
          </div>
        </div>
    </div>

    <div v-else class="max-w-7xl mx-auto p-4 pt-36">
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
              <p class="text-indigo-500">{{ state.users?.[0]?.username }}</p>
            </div>
            <div v-if="state.users?.[1]" class="flex flex-col items-start bg-pink-200 px-6 py-2 rounded-3xl">
              <h3 class="text-lg font-semibold text-pink-700">User 2</h3>
              <p class="text-pink-500">{{ state.users?.[1]?.username }}</p>
            </div>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-3 gap-2 w-full justify-items-center">
              <div
                  v-for="(row, index) in state.board"
                  :key="index"
              >
                <div
                    v-for="(col, colIndex) in row"
                    :key="colIndex"
                    @click="makeMove(index, colIndex)"
                    :class="['w-24 h-24 flex items-center mt-3  justify-center border rounded-lg text-3xl font-bold cursor-pointer', cell === 'X' ? 'text-indigo-500' : 'text-pink-500', winningCombination.includes(index) ? 'bg-yellow-200' : '']"
                >
                  {{ col }}
                </div>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div class="mt-auto">
              <button type="button"
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
                  v-if="state.messages?.length > 0"
                  :ref="messageContainer"
                  class="h-full max-h-[500px] overflow-y-auto p-4 space-y-3 border-[1px] my-4 border-gray-200 rounded-3xl">
                <div v-for="(message, index) in state.messages" :key="index" class="flex flex-col space-x-3">
                  <div v-if="message.sender?._id !== useUser.user._id" class="flex items-center space-x-3">
                    <div class="bg-primary-400 p-1 rounded-full">
                      <img src="/user-1.webp" alt="Bot" class="w-10 h-10"/>
                    </div>
                    <div class="bg-gray-100 px-4 py-2.5 rounded-3xl w-fit max-w-[300px]">
                      <p class="text-gray-900">{{ message.content }}</p>
                    </div>
                  </div>
                  <div v-else class="flex items-center space-x-3 justify-end">
                    <div class="bg-secondary-600 text-end px-4 py-2.5 rounded-3xl text-white w-fit max-w-[300px]">
                      <p>{{ message.content }}</p>
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
