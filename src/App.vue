<template>
    <div class="container">
        <div class="shape-container">
            <div class="page">
                <router-view />
            </div>
            
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
// const router = useRouter()
// router.push('/login')
</script>

<style scoped lang="scss">

.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #d9eaff, #b5d3f3);
  overflow: hidden;

  .shape-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    background: linear-gradient(135deg, #d9eaff, #b5d3f3);
    background-size: 50px 50px;
    background-image: linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px);
    .page{
        height: calc(100vh - 100px);
        width: calc(100vw - 400px);
        // background-color: #fff;
        border-radius: 5px;
    }
  }
}

</style>