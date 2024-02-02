---
layout: ../../layouts/BlogLayout.astro
title: 'A Journey to Find an Ultimate Development Environment'
pubDate: 2024-02-02
description: 'Personal journey in development workflow'
image:
  url: 'https://cdn-images-1.medium.com/max/800/0*vV086gNLrcakrI8E'
  alt: 'utility'
tags: ['go', 'utility']
---

This is my journey of finding the ultimate development environment for my personal needs.

I have several criteria for the ultimate development environment that I dream of. These are they.

1. Easy to set up or at least follow a certain rule to do it.
1. Don't waste time.
1. Operating System (OS) agnostic
1. "Work On My Machine" not anymore.
1. Handle dependency versioning and always up-to-date.
1. Ability to develop anywhere in no time (code local or online).
1. Minimal Resource usage.
1. Text Editor / IDE Compatability for local development.

> DESCLAIMER: This is only tested in Linux because I used Linux for development. The arguments also can be very subjective.

OK, let's get started.

## The Traditional Approach: install each dependency

A traditional way to create a development environment is to install and configure each tool one by one.

An example of this is [XAMPP](https://www.apachefriends.org/), LAMPP, or installing PHP, MySQL, and other dependency separately. Things that I really hate about this method is has a high human error possibility.

In this way, your company usually will have a document or checklist that instructs step by step how to set up your local development environment and even how to set up each deployment to make sure not a single step is overlooked.

Let's compare this approach to the criteria above.

1. ❌ Hard to set up and it usually needs a checklist for it (maybe this criteria is partially incorrect if there is a packaged thing like an XAMPP installer).
1. ❌ Waste of time to install everything one by one and make sure all of them can work together.
1. ❌ Not OS agostic (Windows, Mac, Linux), even in Linux you'll have different configurations of each distro based on their package manager (APT, Yum, Pacman, Zypper), or the worst, you'll need to deal with Dependency Hell in distro like Slackware.
1. ❌ Error-prone, need to make sure that every modified config in local development needs to be updated on the deployment server. This is hard.
1. ❌ When you need two different versions of a dependency, that will need more configuration (especially Linux).
1. ❌ You need to configure it everywhere.
1. ✅ Resource usage is minimal because you only use what you need.
1. ✅ Fully compatible with IDE/Text Editor.

## The Virtual Machine (VM) Approach

Using a virtual machine as an isolated development environment is a good way to keep your host OS clean and easier. when you have trouble configuring your development environment you just reset it using snapshot. You can also use different versions of dependency in each project in different VMs.

Although it offers several benefits. For me, this is my least favorite way to do development until this day. Because it is resource-heavy in CPU, RAM, and Storage you need to develop it inside the VM or need a separate configuration to be able to develop using Host OS.

Let's compare this approach to the criteria above.

1. ❌ Hard to set up tools inside the VM, especially if you also install all tools one by one.
1. ❌ Waste of time to install everything one by one and make sure all of them can work together inside the VM. There is also need time to install the Guest OS.
1. ❌ Not OS agostic for installing each tool in VM.
1. ✅ to deploy, you can just export the VM or use the snapshot.
1. 🟡 Still hard inside VM, but if you decide to use a different VM, that is easy.
1. 🟡 It will work on every machine, but it may take time to install the VM. To develop everywhere you'll maybe need to configure SSH or other Remote Development tools manually.
1. ❌ This is resource-heavy, even if it is Type-1 Virtualization. (CPU, RAM, Storage). This is the worst among all approaches.
1. 🟡 Guest OS is compatible with IDE/Text Editor. But to develop with Host OS is a bit challenging, maybe need to use Remote Development or SSH.

## The Version Manager Approach

The purpose of a version manager is to help you navigate or install any tools for development easily. Version Manager can be one tool for each dependency (e.g. [NVM](https://github.com/nvm-sh/nvm), [g](https://github.com/stefanmaric/g)) or One tool for all dependencies (e.g. [asdf](https://asdf-vm.com/), [mise](https://mise.jdx.dev/)).

This is maybe the way that I use the longest time among the others, it is pretty easy to set up especially when you are using a popular OS (e.g. Ubuntu). These tools might be helpful but it's not perfect. There are some corner cases I've experienced e.g. sometimes you'll need to install several dependencies manually (e.g. install PHP), or you'll need to build from scratch when you use a more niche OS (e.g. NixOS).

Almost all of these tools require setup manually for each tool. Last time I checked, only Mise provided a [declarative way](https://mise.jdx.dev/configuration.html) to configure a development environment.

```toml
[env]

# supports arbitrary env vars so mise can be used like direnv/dotenv

NODE_ENV = 'production'

[tools]

# specify single or multiple versions

terraform = '1.0.0'
erlang = ['23.3', '24.0']

# supports everything you can do with .tool-versions currently

node = ['16', 'prefix:20', 'ref:master', 'path:~/.nodes/14']

# send arbitrary options to the plugin, passed as:

# MISE_TOOL_OPTS\_\_VENV=.venv

python = {version='3.10', virtualenv='.venv'}

[plugins]

# specify a custom repo url

# note this will only be used if the plugin does not already exist

python = 'https://github.com/asdf-community/asdf-python'

[alias.node] # project-local aliases
my_custom_node = '20'
```

Let's compare this approach to the criteria above.

1. ✅ Easy to set up, even with some manual commands, but it's not annoying especially the version manager that provides a declarative way to set up a development environment.
1. ✅ The setup is quite fast most of the time unless you hit the corner cases.
1. ❌ Not really OS agnostic based on the corner cases.
1. 🟡 You'll need to configure the server. Most of the time will work out of the box unless you hit the corner cases.
1. ✅ Handle package versioning really well. You can use different packages in one machine and choose between the oldest and latest versions of that package. I think this is the best way of all.
1. ❌ You'll need to configure the other machine too.
1. ✅ Resource usage is minimal because you only use what you need.
1. ✅ Fully compatible with IDE/Text Editor.

## The Configuration Management Way

> Configuration management is a process for maintaining computer systems, servers, applications, network devices, and other IT components in a desired state. It's a way to help ensure that a system performs as expected, even after many changes are made over time. ~RedHat

In this article's context, it is simply a tool that provides a declarative way to automate your machine/OS to configure the development machine as you want (install package, modify the configuration, etc). Examples of these tools are [Ansible](https://www.ansible.com/), [Puppet](https://www.puppet.com/), etc.

In My case, I use Ansible. Most of the time the config is easy especially when all you need is only install the package from the OS repository. But things can be a little bit challenging when you need to install from scratch or need additional configuration.
This is an example of a simple install OS package

```yaml
---
- name: setup apt apps
  become: true
  apt:
  name: - htop - tmux
  state: latest
```

This is an example of a more challenging config

```yaml
---
- name: setup docker
  become: true
  vars:
  apt_key_path: /etc/apt/keyrings/docker.asc
  block: - name: docker install prerequisite
  apt:
  name: - ca-certificates - curl - gnupg
  state: latest

      - name: docker get upstream distribution codename (ubuntu codename)
        when: is_mint
        shell: . /etc/upstream-release/lsb-release && echo "$DISTRIB_CODENAME"
        register: codename_mint

      - name: docker get distribution codename
        when: is_ubuntu
        shell: . /etc/os-release && echo "$VERSION_CODENAME"
        register: codename_ubuntu

      - name: docker get dpkg architecture
        shell: dpkg --print-architecture
        register: dpkg_arch

      - name: docker set facts
        set_fact:
          distribution_codename: "{{ codename_mint.stdout if is_mint else codename_ubuntu.stdout }}"
          dpkg_arch: "{{ dpkg_arch.stdout }}"

      - name: docker get apt-key
        get_url:
          url: https://download.docker.com/linux/ubuntu/gpg
          dest: "{{ apt_key_path }}"

      - name: docker add repository
        apt_repository:
          repo: deb [arch={{ dpkg_arch }} signed-by={{ apt_key_path }}] https://download.docker.com/linux/ubuntu {{ distribution_codename }} stable
          filename: docker
          state: present

      - name: docker install apps
        apt:
          name:
            - docker-ce
            - docker-ce-cli
            - containerd.io
            - docker-buildx-plugin
            - docker-compose-plugin
          state: latest

      - name: docker enable service
        service:
          name: docker
          state: started
          enabled: true

      - name: docker add group
        group:
          name: docker
          state: present

      - name: docker add user "{{ user }}" into docker group
        user:
          name: "{{ user }}"
          groups: docker
          append: true
```

As you can see when installing docker, you'll need more research about Ansible when doing more complicated tasks e.g. adding a repository, reading OS codename, etc.

I've even tried to automate an OS with Ansible. You can see it [here](https://github.com/labasubagia/devenv-ansible).

Let's compare this approach to the criteria above.

1. 🟡 setup can be easy or hard depending on what you want to accomplish.
1. ✅ a lot of setup/research needs to be done upfront, but when it's already finished, you just need one command to execute all things. I think it's a good investment.
1. ❌ This is not OS agnostic, e.g. different OS may have a different package manager and that also needs separate configurations.
1. ✅ A good way to set up multiple machines.
1. ❌ Can't handle versioning by default. Unless combined with version manager, etc.
1. 🟡 To be able to develop anywhere, you'll need at least run Ansible script and configure SSH or Remote Dev tools.
1. ✅ Resource usage is minimal because you only use what you need.
1. ✅ Fully compatible with IDE/Text Editor Fully compatible with IDE/Text Editor.

## The Nix Package

Nix is a package manager that makes reproducible, declarative, and reliable systems. ~ nixos.org

Nix / Nixpkgs is really good at building reproducible development environments that can be easily duplicated in other machines. Nix takes a functional programming approach where the same input should produce the same output. Nix also works well in other Linux distributions (outside NixOS) and can exist alongside default system package managers like apt and yum.

But so far, the best way to use Nix is by using NixOS itself, because you have a single source of truth to configure your entire system. This is why I admire NixOS so much and hopefully, other OS also take this approach in the future. Other than that, nix is also the largest repository so far with more than 80.000 packages.

Things that I don't really like about Nix is you'll need to learn their scripting language to configure your system. The learning curve is quite steep. Even though the number of packages is large, not all packages are always up to date, and being able to use the latest version requires a slightly challenging approach (e.g. override, unstable package, or directly contribute to Nixpkgs itself).

I also have a configuration in Nix, you can check it [here](https://github.com/labasubagia/dotfiles).

Let's compare this approach to the criteria above.

1. 🟡 setup is challenging in the beginning because you'll need to learn new scripting tools.
1. 🟡 the learning curve is steep, but when you already know it. it is easier.
1. ✅ Mostly so good with Linux and MacOS, but in Windows you can use WSL
1. ✅ Work the same from one machine to another
1. ✅ Versioning is limited to several latest versions, when you need to use older e.g. PHP5 or PHP4 it will not exist in the default repository. It is good enough, but not as good as using Version Manager.
1. 🟡 It is possible to develop everywhere but you'll need to at least config nix first. One way to do it is to Run the Nix command directly on an online NixOS VM (or install Nix first on other OS VM). Then you can configure SSH or remote development tools.
1. ✅ Resource is minimal, you only use what you need. There is also nix-collect-garbage to clean up your system.
1. ✅ Fully compatible with IDE/Text Editor.

## The Containerization

![Container](https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

Containerization is a software deployment process that bundles an application's code with all the files and libraries it needs to run on any infrastructure. Containerization is similiar to a virtual machine except a virtual machine requires an operating system within than bundle.

By using containerization, the application will always have the same configuration that is used in the development environment and production environment. There is no more "It works on my machine". Some examples of containerization technologies are [Docker](https://www.docker.com/) and [Podman](https://podman.io/).

![Meme](https://pbs.twimg.com/media/FPKqqiFX0AMRBu4?format=png&name=small)

There are several ways I use containerization/containers in the development environment.

### Partial Usage

The first way to use it is to use containerization on several dependencies e.g. database, log, etc. You'll do the development process **outside** the containers but use the dependency needed from it.

An example of this is using docker-compose to spin up PostgreSQL, Grafana, Adminer, and Jaeger. But Golang is still installed on the OS. The reason for this is to enable full support of any tools that are required by text editor / IDE. Some IDEs might not be able to fully support all the language features when all the dependencies are inside the container.

I've used this approach for quite a while. The advantage of using this approach it can save resource usage when you need to work with multiple projects simultaneously. This is an example of how I structure the folder.

The same docker dependency is used by several projects at the same timeUsing one shared package in one docker-compose file that can be used on several projects (e.g. bind all ports to hosts). The drawback of this approach is you'll not be able to push the compose file to version control along with the project or you'll need to copy it to every project (unless you use mono repo).

One example of my repo that uses this approach is [here](https://github.com/labasubagia/realworld-backend?tab=readme-ov-file#development-mode). In this case, Include the docker-compose in the project repo.

### Full Usage

The full usage of the container means that you'll do the development **inside** the container. All the tools for development need to be installed inside the container. One of the technologies that leverage this approach is [Devcontainers](https://containers.dev/).

Develop inside a containerThe advantage of this approach is not require any configuration related to the application (except Text Editor and Containerization Tool) in the OS. Several text editors such as [VSCode](https://code.visualstudio.com/docs/devcontainers/containers) or [JetBrains](https://www.jetbrains.com/help/idea/connect-to-devcontainer.html) already support doing development inside a container seamlessly.

When you push your code to Github, you can develop the app using codespace and it will automatically set up an online development environment for you. Other tools will make your life easier when developing using a dev container e.g. [DevPod](https://devpod.sh/).

One disadvantage that I've experienced is when I need to go back and forth between several projects at the same time. Using this approach requires more computer resources to run all dependencies. An example of this is when ProjectA and ProjectB use PostgreSQL, by using this there will be two PostgreSQL instances running.

There is a workaround for cases like this by running PostgreSQL (or any dependencies) using separate docker-compose outside those two projects. However, if you have a high-end PC or are comfortable with that, it's fine.

There is an example of my project that uses Devcontainers [here](https://github.com/labasubagia/realworld-backend)

Based on partial usage and full usage, my assessment regarding the use of containers as a development environment is as follows.

1. ✅ It is easy to set up the development environment when you already know the docker.
1. ✅ The initial setup may take some time, but subsequent setups will be automatic or require fewer commands.
1. ✅ This approach is OS agnostic.
1. ✅ It works on every machine.
1. ✅ You can use any operating system and dependency in a Docker container. It is isolated and up to date, preventing conflicts.
1. ✅ Develop your code from anywhere using tools like DevPod, Codespace, GitPod, and so on.
1. 🟡 It's important to keep in mind that resource usage, such as CPU, RAM, and storage usage, may be high when running the same dependency, such as PostgreSQL, in multiple instances for different projects. Additionally, it's important to regularly monitor storage usage for containerization, as the more projects you have, the more disk space it will consume. If you have a high-end computer, this shouldn't be a problem.
1. 🟡 Not all text editors/IDE support developing inside the container (e.g. Helix, NeoVIM (maybe supported via plugin), Nano, etc.). But if you use partial usage of containerization, this shouldn't be an issue.

## Combination Way

All the approaches above are not exclusive to each other. In my Software Engineering Career, I've combined several approaches above to get the best out of it. Some examples are:

1. Use NixOS with declarative configuration along with docker in almost all of my projects. The Nixpkgs are used to configure the OS as a whole and Install the programming language. Partial Usage of docker for dependencies like Database, Log, and Monitoring dashboard.
1. Using Version Manager along with Configuration Management when I use LinuxMint. You can check it [here](https://github.com/labasubagia/devenv-ansible/blob/3f0ba3024305771c336f9e6d1b53e917b7a5b3ec/roles/devenv/tasks/softwares/asdf.yml).
1. Partial Usage of Containerization itself is also an example combination of a traditional way to install programming language and its tool in the OS using the default package manager for better text editor support and run dependencies like Database using Docker.

You can utilize all the approaches above to satisfy your needs.

## Honorable Mention: Google Colab

If you ask me: "Is there any tool or development environment that satisfies all your criteria or at least almost all of it?". My answer will be [Google Colab](https://colab.google/).

I encountered this when I was learning about Machine Learning and all related to that stuff. One tool that is always recommended everywhere is Google Colab. It's a free development environment that you can access anywhere. This tool also can be used to develop real projects. Even when I don't have GPU on my machine, Google Collab already provides it.

All you need to have before to be able to access Google Colab is a Web Browser and a Google Account (I think everyone already have it). This is the best development experience that I have had so far. Currently, Devcontainers is the one that is close to this (especially with Github Codespace).

## Summary

It's a quite long journey so far, sometimes I still exploring other tools or other approaches to improve my development workflow. For now, I mostly use Devcontainer for my primary projects and use Version Manager or default package manager for small side projects. For side projects, I don't want to use too much storage for now, because of storage limitations.

That's all for me, right now. Maybe I will update this article when I discover some interesting tools or approaches to improve development workflow.

I hope you get something from this article. Forgive any grammar mistakes (English is not my native language).

Thank you.
