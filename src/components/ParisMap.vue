
<script setup>
import L, { LatLng } from "leaflet";
import piesData from '../assets/pies.json'
import { LMap, LTileLayer, LMarker, LIcon, LImageOverlay } from "@vue-leaflet/vue-leaflet";
import Chart from 'chart.js/auto';
import "leaflet/dist/leaflet.css";

import { onMounted, reactive, ref, watch } from "vue";

const pies = reactive(piesData)

onMounted(() => {

    // const chartSize = ref(200)

    // const divIcon = L.divIcon({
    //     html: makeHtml(2),
    //     className: 'divIcon',
    //     iconSize: [200, 200],
    //     iconAnchor: [100, 100]
    //     });

    // const map = L.map('map-container').setView([48.913749, 2.225493], 12);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 19,
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo(map);
    // const latLngBounds = L.latLngBounds([[48.913, 2.205], [48.802, 2.428]]);
    // const imageOverlay = L.imageOverlay('/src/assets/paris_bien_etre_small.jpg', latLngBounds, {opacity : 1}).addTo(map);
    // const marker = L.marker([48.879411, 2.290932], {
    //     icon: divIcon,
    // }).addTo(map);
    setTimeout(() => {
        addPie()
    }, 1000)

    console.log(map.value)
    // map.on('zoomend', function() {
    //     const zoom = map.getZoom();
    //     console.log(zoom)
    //     const size = 13*zoom
    //     console.log(divIcon)
    //     document.getElementsByClassName("chart-container")[0].style.width = `${size}px`
    //     document.getElementsByClassName("chart-container")[0].style.height = `${size}px`
    //     console.log(divIcon.options.iconSize)
    // });

})
const pie = ref(null)
let ch = []
const nb_1_male_1_female = ref(0)


const addPie = () => {
    ch.forEach((item) => item.destroy())
    ch = []
    pies.forEach((pie) => {
        const canvas = document.getElementById(pie.title)
        ch.push(new Chart(canvas, {
            type: 'pie',
            data: {
                labels: pie.data.map((item) => item.label),
                datasets: [{
                    label: pie.title,
                    data: pie.data.map((item) => item.value),
                    backgroundColor: pie.data.map((item) => item.backgroundColor),
                    borderColor: '#000',
                    borderWidth: .5
                }],
            },
            options: {
                rotation: 180,
                layout: {
                    padding: {
                        right: 110,
                        left: 110,
                        top: 0,
                        bottom: 0
                    }
                },
                animation: {
                    duration: 0
                },

                plugins: {
                    legend: {
                        display: false
                    },
                }
            }
        }))
    })
}
const zoom = ref(12)

const map = ref(null)

const zoomUpdated = (newZoom) => {
    console.log(map, map.value.center[0])
    zoom.value = newZoom

    redrawCharts()
}

const initialLat = 48.879411

const getCircleSizeInPixels = (circleSizeInMeters) => {
    const lat = map.value ? map.value.center[0] : initialLat
    const metersPerPx = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom.value)
    const size = circleSizeInMeters / metersPerPx
    return size + 220;
}

const circleSizeInPixels = ref(getCircleSizeInPixels())

const redrawCharts = () => {
    circleSizeInPixels.value = getCircleSizeInPixels();
    setTimeout(() => {
        addPie()
    }, 100);
}

const circlePositionUpdated = (pie, newPosition) => {
    console.log(pie, newPosition)
    pie.latitude = newPosition.lat
    pie.longitude = newPosition.lng
}

watch(pies, (newVal) => {
    console.log("pies update", newVal)
    redrawCharts()
})

const selectPie = (index) => {
    selectedPie.value = index
    redrawCharts()
}

const valChange = (selectedPieIndex, dataIndex) => {
    const pie = pies[selectedPieIndex]
    const sum = pie.data.reduce((acc, item) => acc + item.value, 0)
    const nextData = pie.data[(dataIndex + 1) % pie.data.length]
    nextData.value += 100 - sum
    redrawCharts()
}
const selectedPie = ref(0)
</script>

<template>
    <!-- <img src="src/assets/paris_bien_etre.jpg" /> -->
    <div id="map-container">
        <l-map ref="map" :zoom="zoom" :center="[initialLat, 2.225493]" @update:zoom="zoomUpdated">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
                name="OpenStreetMap"></l-tile-layer>
            <l-image-overlay url="/src/assets/paris_bien_etre_small.jpg" :bounds="[[48.913, 2.205], [48.802, 2.428]]" />
            <l-marker v-for="(pie, index) in pies" :key="pie.title" :lat-lng="[pie.latitude, pie.longitude]"
                :draggable="true" @update:lat-lng="position => circlePositionUpdated(pie, position)"
                @click="() => selectPie(index)">
                <l-icon :icon-size="[getCircleSizeInPixels(pie.sizeInMeters), getCircleSizeInPixels(pie.sizeInMeters)]"
                    :icon-anchor="[getCircleSizeInPixels(pie.sizeInMeters) / 2, getCircleSizeInPixels(pie.sizeInMeters) / 2]"
                    class-name="someExtraClass">
                    <div class="chart-container">
                        <canvas :id="pie.title" ref="pie"></canvas>
                    </div>
                </l-icon>
            </l-marker>
        </l-map>
        <p>Selected pie : {{ pies[selectedPie].title }}</p>

        <label> Circle size in meters</label>
        <input id="size_in_meters" type="number" min="300" max="1000" step="3"
            v-model.number="pies[selectedPie].sizeInMeters" />
        <output>{{ pies[selectedPie].sizeInMeters }}</output>
        <div v-for="(item, index) in pies[selectedPie].data" :key="item.label">

            <label>{{ item.label }}, {{ index }}</label>
            <input type="number" min="0" max="100" step="1" v-model.number="item.value"
                @change="(e) => valChange(selectedPie, index)" />
            <output>{{ item.value }}</output>
        </div>
        <pre>{{ pies }}</pre>
    </div>
</template>

<style>
div {
    color: red;
}

#map-container {
    height: 80vh;
    width: 100vw;
}

.chart-container {
    transition: width 0.5s, height 0.5s;
}

canvas {
    border: 1px solid red;
    cursor:move;
}</style>
