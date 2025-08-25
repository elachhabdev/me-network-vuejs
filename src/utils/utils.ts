import type { NodeDevice } from '@/models/node'
import type { ShallowRef } from 'vue'

export function itemsEqual(items1: NodeDevice[], items2: NodeDevice[]): boolean {
  if (items1.length !== items2.length) return false

  const ids1 = new Set(items1.map((item) => item.id))
  const ids2 = new Set(items2.map((item) => item.id))

  if (ids1.size !== ids2.size) return false

  for (const id of ids1) {
    if (!ids2.has(id)) return false
  }

  return true
}

export const updateDualList = <T>(
  lists: [ShallowRef<T[]>, ShallowRef<T[]>],
  updater: (item: T) => T,
) => {
  const [list1, list2] = lists
  list1.value = list1.value.map(updater)
  list2.value = list2.value.map(updater)
}

export function intersectionSets(set1: Set<string>, set2: Set<string>) {
  const arr1 = [...set1]
  const com = arr1.filter((a) => set2.has(a))
  return new Set(com)
}
