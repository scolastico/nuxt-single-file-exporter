import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      alert: () => {
        alert('Hello World!')
      }
    }
  }
})
