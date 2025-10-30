<template>
    <div class="h-screen flex items-center flex-col gap-5 justify-center">
        <h2 class="text-4xl font-semibold">Page not found</h2>
        <p class="w-full mx-auto max-w-[600px]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam alias eum quo odit laboriosam corporis dolor officia quas dolores
            debitis molestias voluptates reprehenderit omnis id, praesentium sed aspernatur? Asperiores, sed?
        </p>
        <el-button @click="$router.go(-1)"> Go back </el-button>
    </div>
</template>