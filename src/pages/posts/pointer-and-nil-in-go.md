---
layout: ../../layouts/BlogLayout.astro
title: 'Pointer and Nil in Go: Reasons why we should be wary'
pubDate: 2024-02-12
description: 'The part when Go can be harmful'
image:
  url: 'https://dev-to-uploads.s3.amazonaws.com/uploads/articles/j13hvcaopqhanpvs6utn.png'
  alt: 'pointer'
tags: ['go', 'pointer', 'nil']
---

Hi guys. This time, we will talk about Pointers and Nil, which are related to one another, and why we must be careful when handling these two things in Go.

> While it is wise to learn from experience <br/>
> it is wiser to learn from the experiences of others. </br> > **~ Rick Warren**

## Pointer

Pointer is a feature that is quite common in low-level languages ​​such as C/C++. A pointer is an object/variable that stores a memory address, which later the object/variable can access the value of that memory address. Pointers, in simple terms, are where one variable references a value to another place (Pointing).

One of the uses of pointers is to save memory usage when using data that is quite large. For example, pass a large array to a function. However, pointers are dangerous because of their challenges, so several programming languages, such as Java, Python, Javascript, etc., remove this feature from being accessed directly by programmers, even though they are still used indirectly.

![Spidey Pointing each other](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1n3ku7s341ovaz2l5o5o.png)

## Nil

Nil or Null indicates the absence of value or that a variable has no value. Pointers are closely related to nil. In the Go programming language, the default value for pointers is nil.

![0 vs nil](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ui1jh5wv1sjud02t17xn.png)

## Pointer in Go

In the Go, a pointer is explicitly indicated by the codebase's symbols `*` and `&`. The following is an explanation of these two symbols.

- `&` (reference) is used to get the memory address of a variable
- `*` (dereference) is used to get the variable's value pointed to by the pointer.

```go
var1 := 12

// pointer1 refer to var1
pointer1 := &var1

fmt.Println(pointer1)
// Output: 0xc000012028

// Ask the pointer1, what is the value of the object you refer to
fmt.Println(*pointer1)
// Output: 12

var1 = 33
fmt.Println(*pointer1)
// Output: 33
```

Memory management in the Go is not as broad as in other languages, such as C/C++, where the programmer must allocate and deallocate the program's memory. Garbage collector makes several challenges in the C/C++ language no longer exist in Go, for example, dangling pointers (pointers that point to memory addresses that have been cleared), memory leaks, and minimizing human error when programming compared to manual memory management.

## Pointer Problems in Go

![junior vs senior](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qgz9beixpfwu5fjwh2p2.png)

The pointer problem is closely related to the nil. One of the common problems in Go is the **nil dereference error** or, in other programming languages, usually known as **Null Pointer Exception**. This error occurs when a pointer asks the value of a memory address that refers to nil/nothing. This error will invoke panic error. Panic errors in Go can stop the entire running program. Here is an example.

```go
package main

import "fmt"

func main() {
    var pointer1 *int // the value is nil
    fmt.Println(*pointer1)
}

// RESULT:
// panic: runtime error: invalid memory address or nil pointer dereference
// [signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x480496]

// goroutine 1 [running]:
// main.main()
//  /tmp/sandbox751150285/prog.go:7 +0x16

// Program exited.
```

Before doing anything to the pointer variable, the variable must be checked whether the pointer is nil.

```go
package main

import "fmt"

func main() {
    var pointer1 *int
    if pointer1 != nil {
        fmt.Println(*pointer1)
    }
}
```

This is relatively easy to do once we know we use pointers. This can be seen from using the symbols `*` and `&` in the codebase, which explicitly use pointers in Go.

## The Dangers of Pointers in Go

![NPE](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/et36vcp5kiae7jipewo8.gif)

Handling pointers that are used **explicitly** (where there are symbols `*` and `&` in the source code) is easy because they are visible directly when we are programming, and we can easily find these symbols in the codebase using a text editor.

The danger arises when there is **implicit** use of pointers where even the programmer is unaware that they are using pointers. The two symbols `*` and `&` are not shown in the codebase, so the nil check is often missed. This usually continues in code reviews, where reviewers are also often unaware because it requires high accuracy to detect the implicit use of pointers. For example, see the following code.

```go
package main

import "fmt"

type UserInput struct {
    Name string
    Age  int
}

type UserRepository interface {
    SaveToDB(UserInput) error
}

type userService struct {
    userRepository UserRepository
}

func (s userService) Create(input UserInput) error {
    return s.userRepository.SaveToDB(input)
}

func main() {
    userService := userService{}
    userService.Create(UserInput{Name: "John", Age: 10})
}

// RESULT:
// panic: runtime error: invalid memory address or nil pointer dereference
// [signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x45caf0]

// goroutine 1 [running]:
// main.userService.Create(...)
//  /tmp/sandbox2421441321/prog.go
// main.main()
//  /tmp/sandbox2421441321/prog.go +0x10

// Program exited.
```

In the code above, there is no explicit use of pointers, no `*` and `&` symbols in the source code. Where did the pointer error occur, and for what reason?

The error occurs in the source code above because the `userService.userRepository` value is nil. This is because when initializing, `userService:= userService{}` does not include values from `userRepository`, which has a type of interface. Interface in Go has a default value of nil. This error is not detected at compile time. A panic error will occur when the `userService.Create()` method is invoked.

This can be solved by creating a constructor function like the following source code.

```go
package main

type UserInput struct {
    Name string
    Age  int
}

type UserRepository interface {
    SaveToDB(UserInput) error
}

type userRepository struct {
}

func (r userRepository) SaveToDB(input UserInput) error {
    return nil
}

type UserService interface {
    Create(UserInput) error
}

type userService struct {
    userRepository UserRepository
}

func (s userService) Create(input UserInput) error {
    return s.userRepository.SaveToDB(input)
}

func NewUserService(userRepository UserRepository) UserService {
    return &userService{userRepository: userRepository}
}

func main() {
    // initialize using the constructor
    userService := NewUserService(userRepository{})

    // call method
    userService.Create(UserInput{Name: "John", Age: 10})
}
```

The code above works well and can solve the previous problem. The code above is good if only a few interfaces are used. When using several interfaces, human error is possible, for example.

```go
type transactionService struct {
   userRepository    UserRepository
   productRepository ProductRepository
   orderRepository   OrderRepository
   paymentRepository PaymentRepository
}

func (s transactionService) Create(input TransactionInput) error {
    user, _ := s.userRepository.Get(input.UserID)
    product, _ := s.productRepository.Get(input.ProductID)
    balance, _ := s.paymentRepository.GetBalance(input.UserID)
    totalPrice := input.Quantity * balance * product.Price
    _, err := s.orderRepository.Save(Order{
        UserID:     user.ID,
        ProductID:  input.ProductID,
        Quantity:   input.Quantity,
        TotalPrice: totalPrice,
    })
    return err
}

func NewTransactionServiceFail1(
    userRepository UserRepository,
    productRepository ProductRepository,
    orderRepository OrderRepository,
    paymentRepository PaymentRepository,
) TransactionService {
    return &transactionService{
        userRepository:    userRepository,
        productRepository: productRepository,
        orderRepository:   orderRepository,
        // MISTAKE 1: Forget to add a parameter here
    }
}

func NewTransactionServiceFail2(
   userRepository UserRepository,
   productRepository ProductRepository,
   paymentRepository PaymentRepository,
   // MISTAKE 2: Forget to add a parameter of an interface
) TransactionService {
   return &transactionService{
       userRepository:    userRepository,
       productRepository: productRepository,
       paymentRepository: paymentRepository,
   }
}
```

The two constructor functions will not error when initializing the struct but will error when the `Create()` method is called. This is because there is a nil field in the `transactionService` struct. A strict code review process is needed to prevent this, but this human error often occurs when many interfaces are used.

The solution to this problem is to check when the struct is initialized so we can detect errors earlier. The following is an example implementation of this solution.

```go
func NewTransactionService(
    userRepository UserRepository,
    productRepository ProductRepository,
    orderRepository OrderRepository,
    paymentRepository PaymentRepository,
) TransactionService {
    svc := transactionService{
        userRepository:    userRepository,
        productRepository: productRepository,
        orderRepository:   orderRepository,
        paymentRepository: paymentRepository,
    }
    if !Valid(svc) {
        panic("please initialize correctly")
    }
    return &svc
}

func Valid(s any) bool {
    v := reflect.ValueOf(s)
    t := v.Type()

    if t.Kind() != reflect.Struct {
        return false
    }

    for i := 0; i < t.NumField(); i++ {
        field := v.Field(i)
        if field.Kind() == reflect.Interface && field.IsNil() {
            return false
        }
    }
    return true
}
```

Using this solution, the `Valid` function protects the struct so that no fields have a nil value. In this function, each field is looped and checked whether it is of the interface data type and has a nil value. Just remember to be careful when using functions that use `reflection`.

Another example of a nil interface is the `error` interface.

```go
package main

import "fmt"

func main() {
    var err error
    fmt.Println(err.Error())
}

// RESULT:

// panic: runtime error: invalid memory address or nil pointer dereference
// [signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x480490]

// goroutine 1 [running]:
// main.main()
//  /tmp/sandbox174934985/prog.go:7 +0x10

// Program exited.
```

## Nil Default Value

In the Go programming language, data types have default values. For example, a string is "" (empty string), float and int = 0, and boolean = false. Several data types use nil as the default value: interface, pointer, slice, map, and channel. These data types are what we need to handle carefully.

```go
package default_value

import (
   "testing"

   "github.com/stretchr/testify/require"
)

type I interface {
   M()
}

func TestDefaultValue1(t *testing.T) {
   var pointer *int
   var slice []int
   var m map[string]any
   var channel chan int
   var i I

   require.Nil(t, pointer)
   require.Nil(t, slice)
   require.Nil(t, m)
   require.Nil(t, channel)
   require.Nil(t, i)
}

// Test: Passed
```

Like the interface in the previous discussion, slice, map, and channel are examples of implicit use of pointers in Go because there is no use of `&` and `*` symbols. Of course, this makes us need to be more careful when using these three data types because it may trigger unusual behaviour.

### Slice

Slices are a nullable data type in Go, unlike arrays. The slice itself has a default value of nil. Let's take a look at the following source code.

```go
package main

import "fmt"

func main() {
    var s []int
    if s == nil {
      fmt.Println("it is nil", s)
    }
}

// Output: it is nil []
```

The slice has a nil value in that source code, but when printed, it will produce `[]`. That's quite strange, isn't it?. Next, let's compare it with the source code below.

```go
package main

import "fmt"

func main() {
    s := []int{} // using slice literal
    if s == nil {
        fmt.Println("it is nil", s)
    } else {
        fmt.Println("it is not nil", s)
    }
}

// Output: it is not nil []
```

Nil slice and Empty slice are represented similarly in Go to reduce ambiguity and consistency in how slices are handled in the Go programming language.

This is where we need to be careful because not all behaviour will be like this. One of them is the default Go `encoding/json` library that differentiates those two cases.

```go
package main

import (
    "encoding/json"
    "fmt"
)

type Example struct {
    NilSlice   []int `json:"nil_slice"`
    EmptySlice []int `json:"empty_slice"`
}

func main() {
     var nilSlice []int
     emptySlice := []int{}

     example := Example{NilSlice: nilSlice, EmptySlice: emptySlice}
     bytes, _ := json.Marshal(example)
     fmt.Println(string(bytes))
}

// Output: {"nil_slice":null,"empty_slice":[]}
```

This won't be a problem in Go. Still, it will be problematic when it's used as an API by other applications that use different programming languages that differ in handling nil and empty arrays. I have experienced this case when migrating the backend to Go while the frontend Javascript application should not have changed. Several errors appeared on the front end due to not handling this case.

### Map

Handle nil on the map is more tricky than the slice. We cannot use a map with a default value of nil because it will cause a panic error.

```go
package main

import (
   "fmt"
)

func main() {
   var m map[string]any
   m["key"] = 12
   fmt.Println(m)
}

// RESULT:
// panic: assignment to entry in nil map

// goroutine 1 [running]:
// main.main()
//  /tmp/sandbox3489622551/prog.go:9 +0x2c

// Program exited.
```

Therefore, we should always initialize the map using the map literal or the `make` function.

```go
package main

import "fmt"

func main() {
    var m0 = map[int]int{} // map literanl
    var m1 = make(map[int]int) // make function
    m2 := map[int]int{} // map literal
    m3 := make(map[int]int) // make function

    m0[1] = 1
    m1[2] = 2
    m2[3] = 3
    m3[4] = 4

    fmt.Println(m0, m1, m2, m3)
}

// Output: map[1:1] map[2:2] map[3:3] map[4:4]
```

When we want to use multiple keys, we can use a nested map, which is also quite vulnerable to nil errors.

```go
package main

import "fmt"

func main() {
    m := map[int]map[int]int{}
    m[1][1] = 1
    fmt.Println(m)
}

// RESULT:
// panic: assignment to entry in nil map

// goroutine 1 [running]:
// main.main()
//  /tmp/sandbox1619142114/prog.go:7 +0x45

// Program exited.
```

Even though it has been initialized as above, items in the nested map must also be initialized to avoid this error. Another way to prevent this is to use a combined key using a string when multiple keys are needed.

```go
package main

import "fmt"

func main() {
    // first way (nested map)
    m := map[int]map[int]int{}
    m[1] = map[int]int{}
    m[1][1] = 1

    // second way (combination keys using a string)
    m1 := map[string]int{}
    m1[fmt.Sprintf("%v_%v", 1, 1)] = 1

    fmt.Println(m, m1)
}

// Output: map[1:map[1:1]] map[1_1:1]
```

### Channel

Channels in Go are a feature to connect one goroutine with another goroutine, where this channel can be used to exchange information between goroutines. Channel is a data type that uses nil as the default value.

![go channel](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6odeu6xgsdipd7ayza5x.png)

Channels with nil value cannot be used because they will cause the program to be deadlocked.

```go
package main

import (
    "fmt"
)

func main() {
    var done chan bool

    values := []string{"a", "b", "c"}
    for _, v := range values {
        go func(v string) {
            fmt.Print(v)
            done <- true
        }(v)
    }

    for range values {
        <-done
    }

}

// RESULT:
// cab
// fatal error: all goroutines are asleep - deadlock!

// goroutine 1 [chan receive (nil chan)]:
// main.main()
//  /tmp/sandbox2242567277/prog.go:19 +0x149

// goroutine 6 [chan send (nil chan)]:
// main.main.func1({0x4b1d28?, 0x0?})
//  /tmp/sandbox2242567277/prog.go:14 +0x69
// created by main.main in goroutine 1
//  /tmp/sandbox2242567277/prog.go:12 +0x75

// goroutine 7 [chan send (nil chan)]:
// main.main.func1({0x4b11b8?, 0x0?})
//  /tmp/sandbox2242567277/prog.go:14 +0x69
// created by main.main in goroutine 1
//  /tmp/sandbox2242567277/prog.go:12 +0x75

// goroutine 8 [chan send (nil chan)]:
// main.main.func1({0x493458?, 0x0?})
//  /tmp/sandbox2242567277/prog.go:14 +0x69
// created by main.main in goroutine 1
//  /tmp/sandbox2242567277/prog.go:12 +0x75

// Program exited.
```

So, always use the `make()` function when initializing channels.

```go
package main

import (
    "fmt"
)

func main() {
    done := make(chan bool)

    values := []string{"a", "b", "c"}
    for _, v := range values {
        go func(v string) {
            fmt.Print(v)
            done <- true
        }(v)
    }

    for range values {
        <-done
    }
}

// Output: cab
```

## Pass By Reference

Function parameters with data types that use nil as a default value do not indicate explicit use of pointers (the symbols `*` and `&`), so we have to check manually.

```go
package main

import (
   "errors"
   "fmt"
)

type I interface {
    M()
}

type i struct{}

func (i i) M() {}

func fn(i I, ch chan int, s []int, m map[int]int) error {
    fmt.Println(i, ch, s, m)
    return nil
}

// manual check for safety
func fn1(i I, ch chan int, s []int, m map[int]int) error {
    if i == nil {
        return errors.New("i interface nil")
    }
    if ch == nil {
        return errors.New("ch channel nil")
    }
    if s == nil {
        return errors.New("s slice nil")
    }
    if m == nil {
        return errors.New("m map nil")
    }
    fmt.Println(i, ch, s, m)
    return nil
}

func main() {
    fn(nil, nil, nil, nil)
    fn1(i{}, make(chan int), []int{}, map[int]int{})
}

// OUTPUT:
// <nil> <nil> [] map[]
// {} 0xc000076060 [] map[]
```

## Summary

Handling related to pointers and nil in the Go programming language requires precision and caution so undesirable behaviour, such as panic or deadlock, does not occur. Explicit pointers can be checked quickly, but implicit pointers are more challenging.

When using a data type with a default value of nil. The general rule I usually use when initializing variables is using **short variable declaration** (using the `:=` operator), which forces us to provide a value before the variable is used. Uses the `make()` function and slice literal (`[]int{}`) and map literal (`map[int]int{}`), and prefers to use a map with string keys when more than one combined key/key is needed.

Improved code review is critical as an initial filter before merging the code with the main codebase.

That's all from me. I hope you get useful insight.

Thank You.
