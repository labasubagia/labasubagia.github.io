interface Image {
  url: string
  alt: string
}

export interface Post {
  title: string
  description: string
  path: string
  image: Image
  pubDate: string
}
