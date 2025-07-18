/*
	main.js
	-------

	The main JavaScript entry point to mount our app.
*/

// include our basic / default styles
import './assets/style.css';

// vue
import { createApp } from 'vue';
import App from './App.vue';

// css
import 'material-design-icons-iconfont/dist/material-design-icons.css';

// mount our app
createApp(App).mount('#app');
