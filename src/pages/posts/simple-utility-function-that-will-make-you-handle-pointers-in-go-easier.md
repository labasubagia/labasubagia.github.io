---
layout: ../../layouts/BlogLayout.astro
title: 'Simple utility function that will make you handle pointers in Go easier'
pubDate: 2024-02-12
description: 'Handle pointer safer and easier'
image:
  url: 'https://media.dev.to/cdn-cgi/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fw4ci9m6zzr2fb0gc0h56.jpg'
  alt: 'go'
tags: ['go', 'pointer']
---

Using Pointer in Go is sometimes inevitable. One case is when I started to learn how to use Go. At that time, the team was migrating the legacy Node.js Backend application to Go. The frontend application is using Javascript.

One nature that was different at that time was dynamic typing language vs static typing language. One thing that is quite annoying is the ability of dynamic-type language to use partial objects to update data.

```js
//let's say all fields in the database table are like this
const user = {
  id: 1,
  name: 'John',
  address: 'Indonesia',
  phone: '+62 881 112 312 xxx',
  isBanned: true,
}

// then from frontend updated like this
const updateInput = {
  name: 'Erick',
}

// update
const updatedUser = { ...user, ...updateInput }

console.log(updatedUser)

// Output:
// {
//   address: "Indonesia",
//   id: 1,
//   isBanned: true,
//   name: "Erick",
//   phone: "+62 881 112 312 xxx"
// }
```

This works fine when the data communication happens between two dynamic-typed languages. But the introduction of Go to the Playground brings a headache. The decision at that time was we were not allowed to change the front end because if it still worked fine, don't touch it.

![if it's works, don't touch it](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dib7cm0cyhxz953c0m6x.png)

So, we need to take the burden to the backend. It's challenging to do because Go uses default values for its data types.

```go
package main

import "fmt"

type User struct {
	ID       int
	Name     string
	Phone    string
	Address  string
	IsBanned bool
}

func (u *User) Update(input User) {
	u.Name = input.Name
	u.Phone = input.Phone
	u.Address = input.Address
	u.IsBanned = input.IsBanned
}

func main() {

	// Imagine this is current user data from the database
	user := User{
		ID:       1,
		Name:     "John",
		Phone:    "+62 881 112 312 xxx",
		Address:  "Indonesia",
		IsBanned: true,
	}

	//This is the update payload
	payload := User{
		Name: "Eric",
	}

	user.Update(payload)

	fmt.Printf("%+v\n", user)
}


// Output: {ID:1 Name:Eric Phone: Address: IsBanned:false}

```

This becomes a headache for people who come from dynamic typing language, and things don't work out. The result in the Go source code is that Go treats the default value as the same as the regular value so that it will replace the previous value.

To resolve this issue, we need something that can mimic the behavior of an object in dynamic typing language. This is when a Pointer comes in. A pointer can indicate the absence of a field in a struct and avoid using a default value (maybe not entirely).

```go
package main

import "fmt"

type User struct {
	ID       *int
	Name     *string
	Phone    *string
	Address  *string
	IsBanned *bool
}

func (u *User) Update(input User) {
	if input.Name != nil {
		u.Name = input.Name
	}
	if input.Phone != nil {
		u.Phone = input.Phone
	}
	if input.Address != nil {
		u.Address = input.Address
	}
	if input.IsBanned != nil {
		u.IsBanned = input.IsBanned
	}
}

func main() {

	// Imagine this is current user data from the database
	ID := 1
	name := "John"
	phone := "+62 881 112 312 xxx"
	address := "Indonesia"
	isBanned := true

	user := User{
		ID:       &ID,
		Name:     &name,
		Phone:    &phone,
		Address:  &address,
		IsBanned: &isBanned,
	}

	//This is the update payload
	updatedName := "Eric"
	payload := User{
		Name: &updatedName,
	}

	user.Update(payload)

	fmt.Printf("%+v\n", user)
}

// Output: {ID:0xc0000aa010 Name:0xc000096070 Phone:0xc000096050 Address:0xc000096060 IsBanned:0xc0000aa018}
```

That is the code that is updated using Pointer. But what the hell is going on with the output? That happened because the pointer holds a memory address, and the `fmt.Printf` cannot handle that directly. So there is extra work that needs to be done.

```go
package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	ID       *int
	Name     *string
	Phone    *string
	Address  *string
	IsBanned *bool
}

func (u User) String() string {
	bytes, _ := json.Marshal(u)
	return string(bytes)
}

func (u *User) Update(input User) {
	if input.Name != nil {
		u.Name = input.Name
	}
	if input.Phone != nil {
		u.Phone = input.Phone
	}
	if input.Address != nil {
		u.Address = input.Address
	}
	if input.IsBanned != nil {
		u.IsBanned = input.IsBanned
	}
}

func main() {

	// Imagine this is current user data from the database
	ID := 1
	name := "John"
	phone := "+62 881 112 312 xxx"
	address := "Indonesia"
	isBanned := true

	user := User{
		ID:       &ID,
		Name:     &name,
		Phone:    &phone,
		Address:  &address,
		IsBanned: &isBanned,
	}

	//This is the update payload
	updatedName := "Eric"
	payload := User{
		Name: &updatedName,
	}

	user.Update(payload)

	fmt.Printf("%+v\n", user)
}

// Output: {"ID":1,"Name":"Eric","Phone":"+62 881 112 312 xxx","Address":"Indonesia","IsBanned":true}
```

Finally, everything that is required for the Backend migration is met.

But, there is something still bogging me. Using a pointer is considered harmful because improper use can lead to **nil dereference error** (in other programming languages, it might be known as **Null Pointer Exception**). This error can stop the entire program.

We need to carefully check the value before using it.

```go
if input.Name != nil {
	u.Name = input.Name
}
if input.Phone != nil {
	u.Phone = input.Phone
}
if input.Address != nil {
	u.Address = input.Address
}
if input.IsBanned != nil {
	u.IsBanned = input.IsBanned
}
```

Assigning value is cumbersome because we need to declare a variable before we can use the value.

```go
ID := 1
name := "John"
phone := "+62 881 112 312 xxx"
address := "Indonesia"
isBanned := true

user := User{
	ID:       &ID,
	Name:     &name,
	Phone:    &phone,
	Address:  &address,
	IsBanned: &isBanned,
}
```

We need a way to resolve this issue.

## Using a simple utility function to make it safer and easier

```go

// get the memory address of a value
func Ptr[T any](value T) *T {
	return &value
}

// get the value of the pointer, or else use another value
func ValOrElse[T any](ptr *T, defaultVal T) T {
	if ptr == nil {
		return defaultVal
	}
	return *ptr
}

// set pointer value safely
func SetPtr[T any](ptr *T, newPtr *T) {
	if newPtr == nil {
		return
	}
	*ptr = *newPtr
}
```

By using the functions above, we can use pointers safer or at least easier than the previous.

```go
package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	ID       *int
	Name     *string
	Phone    *string
	Address  *string
	IsBanned *bool
	IsActive *bool
}

func (u User) String() string {
	bytes, _ := json.Marshal(u)
	return string(bytes)
}

func (u *User) Update(input User) {
	SetPtr(u.Name, input.Name)
	SetPtr(u.Phone, input.Phone)
	SetPtr(u.Address, input.Address)
	SetPtr(u.IsBanned, input.IsBanned)
}

func main() {

	// Imagine this is current user data from the database
	user := User{
		ID:       Ptr(1),
		Name:     Ptr("Name"),
		Phone:    Ptr("+62 881 112 312 xxx"),
		Address:  Ptr("Indonesia"),
		IsBanned: Ptr(true),
	}

	//This is the update payload
	payload := User{
		Name: Ptr("Eric"),
	}

	user.Update(payload)

	fmt.Printf("%+v\n", user)
	fmt.Println("is user active?", ValOrElse(user.IsActive, false))
}

// get the memory address of a value
func Ptr[T any](value T) *T {
	return &value
}

// get the value of the pointer, or else use another value
func ValOrElse[T any](ptr *T, defaultVal T) T {
	if ptr == nil {
		return defaultVal
	}
	return *ptr
}

// set pointer value safely
func SetPtr[T any](ptr *T, newPtr *T) {
	if newPtr == nil {
		return
	}
	*ptr = *newPtr
}

// Output:
// {"ID":1,"Name":"Eric","Phone":"+62 881 112 312 xxx","Address":"Indonesia","IsBanned":true,"IsActive":null}
// is user active? false

```

Using some of the utility above might be subjective, but you can use it if you think the same. For me, it helps me to worry less about nil pointer issues.

Using a pointer above might not be the best way to handle my case. I think a better way is to use an approach using a type like `sql.NullString`. But that will be a topic for the next discussion.

That's all from me. Stay tuned.

Thank you.
