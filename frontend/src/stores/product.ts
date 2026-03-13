import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Product {
  id: string
  code: string
  name: string
  category: string
  description: string
  price: number
  icon: string
}

export const useProductStore = defineStore('product', () => {
  const list = ref<Product[]>([])
  const loading = ref(false)

  function setList(products: Product[]) {
    list.value = products
  }

  return { list, loading, setList }
})
