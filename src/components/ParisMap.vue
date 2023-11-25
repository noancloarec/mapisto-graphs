
<script setup>
import L, { LatLng } from "leaflet";
import piesData from '../assets/pies.json'
import { LMap, LTileLayer, LMarker, LIcon, LImageOverlay } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import GeoPie from "./GeoPie.vue";
import { onMounted, reactive, ref, watch } from "vue";

const pies = reactive(piesData)
console.log("redraw")

const metersPerPx = ref(0)

const map = ref(null)

const center = ref(new LatLng(48.8566, 2.3522))

const zoomUpdated = (newZoom) => {
    const lat = center.value.lat
    metersPerPx.value = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, newZoom)
}



const circlePositionUpdated = (pie, newPosition) => {
    pie.latitude = newPosition.lat
    pie.longitude = newPosition.lng
}

watch(pies, (newVal) => {
    console.log("pies update", newVal)
})

const selectPie = (index) => {
    selectedPie.value = index
}

const addPie = () => {
    pies.push({
        title: "Quartier",
        latitude: center.value.lat,
        longitude: center.value.lng,
        sizeInMeters: 500,
        data: [
            {
                label: "At least 1 male and 1 female",
                value: 1,
                backgroundColor: "#cc766e80"
            },
            {
                label: "At least 1 female",
                value: 4,
                backgroundColor: "#7b968780"
            },
            {
                label: "No domestic - Boss or employee",
                value: 26,
                backgroundColor: "#d9ae3c80"
            },
            {
                label: "No domestic - Worker",
                value: 69,
                backgroundColor: "#72635d80"
            }
        ]
    })
    selectedPie.value = pies.length - 1;
}
const adjustNextSliceToTotal100 = (selectedPieIndex, dataIndex) => {
    const pie = pies[selectedPieIndex]
    const dataSumInPie = pie.data.reduce((acc, item) => acc + item.value, 0)
    const valueToAddSoThatTotalIs100 = 100 - dataSumInPie
    const nextSlice = pie.data[(dataIndex + 1) % pie.data.length]
    nextSlice.value += valueToAddSoThatTotalIs100
}

const selectedPie = ref(0)

</script>

<template>
    <!-- <img src="src/assets/paris_bien_etre.jpg" /> -->
    <div id="map-container">
        {{ metersPerPx }}

        <l-map ref="map" :zoom="12" v-model:center="center" @update:zoom="zoomUpdated">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
                name="OpenStreetMap"></l-tile-layer>
            <l-image-overlay url="/src/assets/paris_bien_etre_small.jpg" :bounds="[[48.913, 2.205], [48.802, 2.428]]" />
            <GeoPie v-for="(pie, index) in pies" :key="pie.title" :lat-lng="[pie.latitude, pie.longitude]"
                :diameter-in-meters="pie.sizeInMeters" :data="pie.data" :meters-per-px="metersPerPx" :id="index"
                :title="pie.title" @click="selectedPie = index" :draggable="selectedPie === index"
                @on-position-updated="position => circlePositionUpdated(pie, position)" />
        </l-map>
    </div>
    <div class="pie-edition-form">
        <button @click="addPie">Add pie</button>
        <select v-model="selectedPie">
            <option v-for="(pie, index) in pies" :key="pie.title" :value="index">{{ pie.title }}</option>
        </select>
        <p>Selected pie : {{ pies[selectedPie].title }}</p>
        <label>Pie title</label>
        <input type="text" v-model="pies[selectedPie].title" />

        <label> Circle size in meters</label>
        <input id="size_in_meters" type="number" min="300" max="1000" step="3"
            v-model.number="pies[selectedPie].sizeInMeters" />
        <output>{{ pies[selectedPie].sizeInMeters }}</output>
        <div v-for="(item, index) in pies[selectedPie].data" :key="item.label">

            <label>{{ item.label }}, {{ index }}</label>
            <input type="number" min="0" max="100" step="1" v-model.number="item.value"
                @change="() => adjustNextSliceToTotal100(selectedPie, index)" />
            <output>{{ item.value }}</output>
        </div>
        <textarea>{{ pies }}</textarea>
    </div>
</template>

<style>
.pie-edition-form {
    display: inline-block;

}

#map-container {
    display: inline-block;
    height: 80vh;
    width: 70vw;
    vertical-align: top;
}

/* canvas {
    border: 1px solid red;
    cursor: move;
} */
</style>
