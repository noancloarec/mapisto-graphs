
<script setup>
import { LImageOverlay, LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { reactive, ref, watch } from "vue";
import piesData from '../assets/pies.json';
import GeoPie from "./GeoPie.vue";
import paris_map from '../assets/paris_bien_etre.jpg';

const pies = reactive(piesData)


const mapElement = ref(null)

const initialCenter = new LatLng(48.8566, 2.3522)
console.log("initialCenter", initialCenter)

/**
 * @type {LatLng}
 * Origin for the pies added by the user, changes as the user moves the map
 */
const pieOrigin = ref(initialCenter)

/**
 * @type {number}
 * Initial zoom level for the map
 */
const initialZoom = 13

/**
 * Set a new position for a pie
 * @param {Object} pie the pie to update
 * @param {LatLng} newPosition the new position for the pie
 */
const setPiePosition = (pie, newPosition) => {
    pie.latitude = newPosition.lat
    pie.longitude = newPosition.lng
}

/**
 * Add a new pie to the map that will have the sames slices as the last one, and select it
 */
const addPieAndSelectIt = () => {
    pies.push({ ...pies[pies.length - 1], title: "Quartier", latitude: pieOrigin.value.lat, longitude: pieOrigin.value.lng })
    selectedPie.value = pies.length - 1;
}

/**
 * When a slice is updated, adjust the next slice so that the total is 100
 * @param {Number} selectedPieIndex 
 * @param {Number} dataIndex 
 */
const adjustNextSliceToTotal100 = (selectedPieIndex, dataIndex) => {
    const pie = pies[selectedPieIndex]
    const dataSumInPie = pie.data.reduce((acc, item) => acc + item.value, 0)
    const valueToAddSoThatTotalIs100 = 100 - dataSumInPie
    const nextSlice = pie.data[(dataIndex + 1) % pie.data.length]
    nextSlice.value += valueToAddSoThatTotalIs100
}
/**
 * @type {number}
 * Index of the pie that is the nearest to the mouse cursor
 */
const nearestPieIndex = ref(0)

const leafletMap = ref(null)

const determinePiesToDisplay = (waitInMs) => {
    setTimeout(() => {
        pies.forEach((pie) => {
            pie.shouldBeDisplayed = pieIsOnMap(pie)
        })
    }, waitInMs)
}

const zooming = ref(false)

/**
 * Adjusts the nearestPieIndex to the pie that is the nearest to the mouse cursor
 * So the pie that is the nearest to the mouse cursor is always on top
 * @param {LMap} map 
 */
const onMapReady = (map) => {
    determinePiesToDisplay(0)
    map.on("mousemove", (e) => {
        const indexAndDistances = pies.map((pie, index) => {
            const distance = new LatLng(pie.latitude, pie.longitude).distanceTo(e.latlng)
            return { index, distance }
        })
        const nearestIndex = indexAndDistances.reduce((nearestIndex, current) => {
            if (current.distance < nearestIndex.distance) {
                return current
            }
            return nearestIndex
        })
        nearestPieIndex.value = nearestIndex.index
        // setTimeout(() => {
        //     console.log("old event", e)
        //     const newEvent = new Event("click")
        //     console.log("newEvent", newEvent)
        //     console.log("mapElement", mapElement.value)
        //     map.fire("click", { latlng: e.latlng,  }, true)
        // }, 1000)
        // console.log({ nearestIndex, nearestPieIndex: nearestPieIndex.value })
    })
    map.on("moveend", () => determinePiesToDisplay(0))
    map.on("zoomend", () => determinePiesToDisplay(1000))
    map.on("zoomstart", () => zooming.value = true)
    map.on("zoomend", () => zooming.value = false)
    leafletMap.value = map

}

const pieIsOnMap = (pie) => {
    const mapBounds = leafletMap.value.getBounds()
    const pieBounds = new LatLng(pie.latitude, pie.longitude).toBounds(pie.sizeInMeters)
    return mapBounds.intersects(pieBounds)
}

/**
 * @type {number}
 * Index of the pie that is currently selected
 */
const selectedPie = ref(0)
/**
 * @type {boolean}
 * Whether to show the old map or not
 */
const showOldMap = ref(true)
/**
 * @type {number}
 * Zoom outputted from leaflet, to adjust pie size
 */
const zoomOnMap = ref(initialZoom)

</script>

<template>
    <div id="map-container">
        <l-map ref="mapElement" @update:zoom="zoomOnMap = $event" :zoom="initialZoom" @update:center="pieOrigin = $event"
            :center="initialCenter" @ready="onMapReady" :max-zoom="18">
            <!-- <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
                                                                                                                            name="OpenStreetMap"></l-tile-layer> -->
            <l-image-overlay v-if="showOldMap" :url="paris_map" :bounds="[[48.913, 2.205], [48.802, 2.428]]" />
            <div v-if="leafletMap">
                <div v-for="(pie, index) in pies" :key="pie.title">
                    <GeoPie v-if="pie.shouldBeDisplayed" :data="pie.data" :title="pie.title" :parent-map="leafletMap"
                        :lat-lng="[pie.latitude, pie.longitude]" :zoomLevel="zoomOnMap"
                        :diameter-in-meters="pie.sizeInMeters" :show-on-top="nearestPieIndex === index"
                        :zooming="zooming" />
                </div>
            </div>
        </l-map>
    </div>
    <div class="pie-edition-form">

        <input type="checkbox" v-model="showOldMap" />
        <button @click="addPieAndSelectIt">Add pie</button>
        <select v-model="selectedPie">
            <option v-for="(pie, index) in pies" :key="pie.title" :value="index">{{ pie.title }}</option>
        </select>
        <p>Selected pie : {{ pies[selectedPie].title }}</p>
        <label>Pie title</label>
        <input type="text" v-model="pies[selectedPie].title" />

        <label> Circle size in meters</label>
        <input id="size_in_meters" type="number" min="300" max="2000" step="3"
            v-model.number="pies[selectedPie].sizeInMeters" />
        <output>{{ pies[selectedPie].sizeInMeters }}</output>
        <div v-for="(item, index) in pies[selectedPie].data" :key="item.label">

            <label>{{ item.label }}, {{ index }}</label>
            <input type="number" min="0" max="100" step="1" v-model.number="item.value"
                @change="() => adjustNextSliceToTotal100(selectedPie, index)" />
            <output>{{ item.value }}</output>
        </div>
        <textarea :value="JSON.stringify(pies)"></textarea>
    </div>
</template>

<style>
.pie-edition-form {
    display: inline-block;
    margin-top: 50px;
}

#map-container {
    display: inline-block;
    height: 80vh;
    width: 80vw;
    vertical-align: top;
}

/* canvas {
    border: 1px solid red;
    cursor: move;
} */
</style>
