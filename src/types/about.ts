interface Position {
  title: string
  description?: string
  fromDate: string
  untilDate: string
  todo: string[]
}

export interface Work {
  logo: string
  url: string
  name: string
  description: string
  positions: Position[]
}
