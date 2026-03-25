<script setup></script>

<template>
    <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" class="fixed left-0 min-h-screen min-w-[100vw]" :style="{ bottom: '-10rem' }" preserveAspectRatio="none">
        <rect x="0" y="0" width="960px" height="540px" fill="var(--surface-ground)"></rect>
        <path
            d="M0 331L26.7 321C53.3 311 106.7 291 160 291C213.3 291 266.7 311 320 329.5C373.3 348 426.7 365 480 373.2C533.3 381.3 586.7 380.7 640 373.8C693.3 367 746.7 354 800 341.2C853.3 328.3 906.7 315.7 933.3 309.3L960 303L960 541L933.3 541C906.7 541 853.3 541 800 541C746.7 541 693.3 541 640 541C586.7 541 533.3 541 480 541C426.7 541 373.3 541 320 541C266.7 541 213.3 541 160 541C106.7 541 53.3 541 26.7 541L0 541Z"
            fill="var(--p-orange-500)"
            strokeLinecap="round"
            strokeLinejoin="miter"
        ></path>
    </svg>
    <div class="flex min-h-screen items-center justify-center px-8">
        <div class="z-10 text-center">
            <div class="mb-6 text-8xl font-bold text-surface-900 dark:text-surface-0">Oops!</div>
            <p class="mb-8 mt-0 text-xl font-medium leading-normal text-surface-700 dark:text-surface-100">There is nothing here</p>
            <router-link to="/dashboard">
                <Button type="button" class="cursor-pointer font-medium" raised severity="warn">Go to Dashboard</Button>
            </router-link>
        </div>
    </div>
</template>
