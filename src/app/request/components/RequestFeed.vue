<template>
	<div>
		<h1>Requests</h1>
		<div v-for="request in requests" :key="request.ID"
		     style="border:1px solid black; padding:10px; margin-bottom:10px;">
			<h4>
				<router-link :to="{name: 'request', params: {id: request.ID}}">Citation: {{request.citation}}
				</router-link>
			</h4>
			<p>Request Date {{request.CreatedAt | formatDate}}</p>
		</div>
	</div>
</template>

<script>
	import {mapGetters} from 'vuex'
	import axios from 'axios'

	export default {
		name: "request-feed",
		computed: {
			...mapGetters({
				user: 'auth/user',
				requests: 'requests/requests',
			}),
		}
	}
</script>

<style scoped>

</style>