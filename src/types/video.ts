import { SearchTag } from './search-tag'

export type Video = {
  id: string
  title: string
  link: string
  tags: Array<SearchTag>
}

export type VideoBody = {
  title: string
  link: string
  tags: Array<SearchTag>
}
