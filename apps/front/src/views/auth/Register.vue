<script setup lang="ts">
import {reactive} from "vue";
import {useRouter} from "vue-router";

const state = reactive({
  email: '',
  password: '',
  confirmationPassword: '',
  message: '',
});
const router = useRouter();
const submit = () => {
  fetch(import.meta.env.VITE_API_HOST + '/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(state),
  }).then(response => {
    console.log(response.body);
  });
}

</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 h-screen">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
           alt="Your Company"/>
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign up for an
        account</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" method="post" @submit.prevent="submit">
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
          <div class="mt-2">
            <input id="email" v-model="state.email" name="email" type="email" autocomplete="email" required
                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
          </div>
          <div class="mt-2">
            <input id="password" v-model="state.password" name="password" type="password"
                   autocomplete="current-password" required
                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="confirmation-password" class="block text-sm font-medium leading-6 text-gray-900">Confirm
              Password</label>
          </div>
          <div class="mt-2">
            <input id="confirmation-password" v-model="state.confirmationPassword" name="password" type="password"
                   autocomplete="current-password" required
                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
          </div>
        </div>

        <div>
          <button type="submit"
                  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Sign in
          </button>
        </div>
      </form>

      <p class="mt-10 text-center text-sm text-gray-500">
        Already a member?
        {{ ' ' }}
        <a href="/login" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Sign in</a>
      </p>
    </div>
  </div>
</template>