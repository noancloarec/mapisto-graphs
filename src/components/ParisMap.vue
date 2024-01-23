
<script setup>

import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { reactive, ref } from "vue";
import piesData from '../assets/pies.json';
import GeoPie from "./GeoPie.vue";
import VueTitle from "./VueTitle.vue";


const pies = reactive(piesData)

const initialCenter = new LatLng(48.8581451743888, 2.315702514296674)

/**
 * @type {LatLng}
 * Origin for the pies added by the user, changes as the user moves the map
 */
const pieOrigin = ref(initialCenter)

const computeZoomLevelBasedOnScreenSize = () => {
    const width = window.innerWidth
    if (width > 1000) {
        return 13
    } else if (width > 600) {
        return 12
    } else {
        return 11
    }
}

/**
 * @type {number}
 * Initial zoom level for the map
 */
const initialZoom = computeZoomLevelBasedOnScreenSize()


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

const risePointedChartToTop = (e, reTriggerMouseMove) => {
    /**
     * Compute nearest pie to make it rise on to so it is not hidden behind overlapping pies
     */
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
    const indexChanged = nearestIndex.index !== nearestPieIndex.value
    nearestPieIndex.value = nearestIndex.index


    if (reTriggerMouseMove && indexChanged) {
        /**
         * If the pie has been rised up, retrigger the mousemove to display the tooltip
         */
        const target = e.originalEvent.target
        setTimeout(() => {
            const newEvent = new MouseEvent("mousemove", {
                target: target,
                clientX: e.originalEvent.clientX + 1,
                clientY: e.originalEvent.clientY + 1,
                screenX: e.originalEvent.screenX + 1,
                screenY: e.originalEvent.screenY + 1,
            })
            const targetElement = document.elementFromPoint(newEvent.clientX, newEvent.clientY)
            targetElement.dispatchEvent(newEvent);
            setTimeout(() => {
                targetElement.dispatchEvent(newEvent)
            })
        }, 50)
    }
}

/**
 * Adjusts the nearestPieIndex to the pie that is the nearest to the mouse cursor
 * So the pie that is the nearest to the mouse cursor is always on top
 * @param {LMap} map 
 */
const onMapReady = (map) => {
    determinePiesToDisplay(0)
    map.on("click", (e) => risePointedChartToTop(e, true))
    map.on("mousemove", (e) => risePointedChartToTop(e, false))
    map.on("moveend", () => determinePiesToDisplay(0))
    map.on("zoomend", () => determinePiesToDisplay(1000))
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

const legendIsDrawnBack = ref(false)
const hidePanel = () => {
    legendIsDrawnBack.value = !legendIsDrawnBack.value
}
</script>

<template>
    <VueTitle :title='$t("page_titles.paris_well_being_1886")'></VueTitle>
    <div id="map-container">
        <l-map @update:zoom="zoomOnMap = $event" :zoom="initialZoom" @update:center="pieOrigin = $event"
            :center="initialCenter" @ready="onMapReady" :max-zoom="16">
            <l-tile-layer url="https://mapisto-tiles.web.app/paris_bien_etre_1886/{z}/{x}/{y}.jpg"
                attribution='Source: <a href= "https://gallica.bnf.fr/ark:/12148/btv1b52510505s/f13.item"> Gallica </a>' ,
                layer-type="base" name="OpenStreetMap" />
            <div v-if="leafletMap">
                <div v-for="( pie, index ) in  pies " :key="pie.title">
                    <GeoPie v-if="pie.shouldBeDisplayed" :data="pie.data" :title="pie.title" :parent-map="leafletMap"
                        :lat-lng="[pie.latitude, pie.longitude]" :diameter-in-meters="pie.sizeInMeters"
                        :show-on-top="nearestPieIndex === index" />
                </div>
            </div>
            <div :class="{ 'legend-panel-container': true, 'drawn-back': legendIsDrawnBack }">
                <button @click="hidePanel">{{ legendIsDrawnBack ? '▲' : '▼' }}</button>
                <div class="legend-panel">
                    <h1>{{ $t("chart_titles.well_being_evaluation_by_number_of_domestic") }}</h1>
                    <div class="legend">
                        <div v-for=" d  in  pies[0].data " :key="d.label" class="legend-row">
                            <div class="legend-color" :style="{ backgroundColor: d.backgroundColor }"></div>
                            <p class="legend-label">{{ $t(d.label) }}</p>
                        </div>
                    </div>
                </div>

            </div>
        </l-map>
    </div>
    <!-- <div class="pie-edition-form">

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
    </div> -->
</template>

<style>
.pie-edition-form {
    display: inline-block;
    margin-top: 50px;
}

#map-container {
    display: inline-block;
    height: 100dvh;
    width: 100vw;
    max-width: 100%;
    vertical-align: top;
}

.leaflet-control-container>div {
    z-index: 10000;
}

.leaflet-container {
    background-color: white;
}

.legend-panel-container {
    color: black;
    position: absolute;
    width: 400px;
    max-width: 100%;
    bottom: 0;
    left: 0;
    z-index: 10000;
    transition: transform 0.5s;
}

.legend-panel-container.drawn-back {
    transform: translateY(100%) translateY(-19px);
}

.legend-panel-container>button {
    color: black;
    border: 1px solid black;
    outline-style: none;
    background-color: #e8d3b6;
    width: 50px;
    margin-bottom: -1px;
    display: block;
    height: 20px;
    border-left: none;
}

.legend-panel {
    padding: 10px;
    background-color: #e8d3b6;
    border-right: 1px solid black;
    border-top: 1px solid black;

}

.legend-panel {
    font-family: "Times New Roman";
}

.legend-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
}

.legend-label {
    margin-left: 10px;
    font-size: .9rem;
}

.legend-color {
    width: 40px;
    min-width: 40px;
    height: 24px;
}
</style>
