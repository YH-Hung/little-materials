import { SearchTag } from './search-tag'

export type Video = {
  title: string
  link: string
  tags: Array<SearchTag>
}
