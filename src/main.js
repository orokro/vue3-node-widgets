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

// mount our app
createApp(App).mount('#app');
