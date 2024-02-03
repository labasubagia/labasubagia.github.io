---
layout: ../../layouts/BlogLayout.astro
title: 'Generic in Golang: Write utility functions more easier'
pubDate: 2023-01-22
description: 'The way to take advantage of generic'
image:
  url: 'https://miro.medium.com/v2/resize:fit:720/format:webp/0*QgrKUm0cBytPeoXU'
  alt: 'utility'
tags: ['go', 'utility']
---

In this article, I will demonstrate why it is easier to write utility functions/methods using Generic in Golang. The utility function itself is a function that performs common behavior and can be reused in several places.

> **Generic programming** is a style of computer programming in which algorithms are written in terms of types to-be-specified-later that are then ? instantiated when needed for specific types provided as parameters.

By using generic in Go, we can have a codebase with less duplication because my codebase had several duplications before I used Generic. Especially the codebase that uses Go version 1.17 and below.

> “Talk is cheap. Show me the code.” ― Linus Torvalds

```go
func InArray(haystack []string, needle string) bool {
  for _, hay := range haystack {
    if hay == needle {
       return true
    }
  }
  return false
}
```

The **InArray** function aims to check whether an item exists in an array. In practice, I need to duplicate the function if I check arrays with another data type.

```go
func InArrayString(haystack []string, needle string) bool {
  for _, hay := range haystack {
    if hay == needle {
       return true
    }
  }
  return false
}

func InArrayInt(haystack []int, needle int) bool {
  for _, hay := range haystack {
    if hay == needle {
      return true
    }
  }
  return false
}

func InArrayFloat(haystack []float64, needle float64) bool {
  for _, hay := range haystack {
    if hay == needle {
      return true
    }
  }
  return false
}
```

If we want to remove code duplication from the codebase without using generic, we can use **reflect** library, especially if the codebase still uses Golang with version 1.17 or below.

```go
func InArray(haystack any, needle any) (bool, error) {
  haystackValue := reflect.ValueOf(haystack)
  if haystackValue.Kind() != reflect.Slice && haystackValue.Kind() != reflect.Array {
     return false, errors.New("haystack is not an array")
  }

  needleValue := reflect.ValueOf(needle)
  for i := 0; i < haystackValue.Len(); i++ {
     val := haystackValue.Index(i)
     if val.Kind() == needleValue.Kind() && val.Interface() == needleValue.Interface() {
       return true, nil
     }
  }

  return false, nil
}
```

Using **reflect** can remove the duplication in the code, but, It will increase the complexity of the function. But with a cost, we somehow lose the "**static typing**" ability because it needs to check the data type at runtime. Besides that, we need to ensure the input provided is valid and handle errors when we use the function.

If you still want to avoid adding more complexity to your code, you can convert the array first and then pass it to the utility function.

```go
// Declaration
func InArray(haystack []string, needle string) bool {
  for _, hay := range haystack {
    if hay == needle {
       return true
    }
  }
  return false
}


func main() {

  // Usage
  haystack := []int{1, 2, 3, 4, 5}
  needle := 1

  haystackString := make([]string, 0, len(haystack))
  for _, hay := range haystack {
     haystackString = append(haystackString, string(hay))
  }

  fmt.Println(InArray(haystackString, string(needle)))
}
```

With conversion, you need to convert your array every time your array type is different from the **InArray** argument. In other words, you will still have duplicate code when you use that utility function. Besides that, the conversion adds more complexity to your code (time complexity in the code above).

We can remove duplication and still have a simple code using Generic.

```go
func InArray[T comparable](haystack []T, needle T) bool {
  for _, hay := range haystack {
    if hay == needle {
      return true
    }
  }
  return false
}
```

The code with generic and without generic at first is similar, and you don't have to add more complexity like when using **reflect** library.

Generic is suitable for making a utility function with more than one input type. But don't overuse it.

Ok, that's all. You can also play with the code [here](https://go.dev/play/p/5tqEBlo_mmk). Thank you.
