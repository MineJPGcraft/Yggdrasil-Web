import {createApp} from 'vue'
import type {AxiosStatic} from 'axios'
import axios from 'axios'
import './style.css'
import './themes/index.css'
import App from './App.vue'
import router from './router';

declare module 'vue' {
    interface ComponentCustomProperties {
        $axios: AxiosStatic
    }
}

const app = createApp(App);
app.use(router);
app.config.globalProperties.$axios = axios;
app.mount('#app');
