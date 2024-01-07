<script lang="ts">
  import { Motion } from 'svelte-motion'

  interface Route {
    name: string
    path: string
    target?: string
  }

  const routes: Route[] = [
    { name: 'About', path: '/' },
    {
      name: 'Github',
      path: 'https://github.com/labasubagia',
      target: '_blank',
    },
    { name: 'Blog', path: '/blog' },
  ]

  let toggle: boolean = false
  const onToggle = (): void => {
    toggle = !toggle
  }
</script>

<nav class="px-3 py-6 border-b-2">
  <div class="max-w-screen-lg mx-auto flex justify-between items-center">
    <a href="/" class="flex items-center justify-between">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-code-square mr-2 w-10 h-10"
        ><rect width="18" height="18" x="3" y="3" rx="2" /><path
          d="m10 10-2 2 2 2"
        /><path d="m14 14 2-2-2-2" /></svg
      >
      <div class="text-xl font-bold">Laba Subagia</div>
    </a>

    <div>
      <button
        class="flex justify-center items-center md:hidden"
        on:click={onToggle}
      >
        <div class="z-20">
          <Motion
            animate={{
              rotateZ: toggle ? 45 : 0,
              y: toggle ? 10 : 0,
              width: toggle ? 30 : 30,
            }}
            let:motion
          >
            <span use:motion class="bg-content block w-7 h-0.5 bg-black mb-1"
            ></span>
          </Motion>
          <Motion animate={{ width: toggle ? 0 : 20 }} let:motion>
            <span use:motion class="bg-content block w-5 h-0.5 bg-black mb-1"
            ></span>
          </Motion>
          <Motion
            animate={{
              rotateZ: toggle ? -47 : 0,
              width: toggle ? 30 : 15,
              y: toggle ? -2 : 0,
            }}
            let:motion
          >
            <span use:motion class="bg-content block w-3 h-0.5 bg-black mb-1"
            ></span>
          </Motion>
        </div>
      </button>

      <div class="hidden md:flex">
        {#each routes as route}
          <a href={route.path} target={route?.target ?? null}>
            <div class="menu-item">
              {route.name}
            </div>
          </a>
        {/each}
      </div>

      {#if toggle}
        <Motion
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 25 }}
          let:motion
        >
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="fixed top-0 left-0 bg-white w-full h-full z-10 flex justify-center items-center"
            on:click={onToggle}
            use:motion
          >
            <div class="w-full">
              {#each routes as route}
                <a href={route.path} target={route?.target ?? null}>
                  <div class="menu-item">
                    {route.name}
                  </div>
                </a>
              {/each}
            </div>
          </div>
        </Motion>
      {/if}
    </div>
  </div>
</nav>

<style>
  .menu-item {
    @apply text-center p-4;
  }
  .menu-item:hover {
    @apply bg-gray-200;
  }
</style>
