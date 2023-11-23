
<script setup>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { onMounted } from "vue";
onMounted(() => {
    const map = L.map('map-container').setView([48.913749, 2.225493], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const latLngBounds = L.latLngBounds([[48.913, 2.205], [48.802, 2.428]]);
    const imageOverlay = L.imageOverlay('/src/assets/paris_bien_etre.jpg', latLngBounds, {opacity : 1}).addTo(map);

})


</script>

<template>
    <!-- <img src="src/assets/paris_bien_etre.jpg" /> -->
    <div id="map-container">
    </div>
</template>

<style scoped>
div {
    color: red;
}

#map-container {
    height: 80vh;
    width: 100vw;
}
</style>
