<script setup>
import { defineProps, defineEmits, onMounted, ref, watch } from 'vue'
import L, { LatLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LIcon, LImageOverlay } from "@vue-leaflet/vue-leaflet";
import Chart from 'chart.js/auto';

onMounted(() => {
    console.log("mounted")
    setTimeout(() => {
        drawChart()
    }, 1000)
})

const props = defineProps(['id', 'lat-lng', 'diameter-in-meters', 'data', 'title', 'meters-per-px', 'draggable'])
const emit = defineEmits(['on-position-updated'])

const circlePositionUpdated = (newPosition) => {
    console.log("circlePositionUpdated")
    emit('on-position-updated', newPosition)
}
const container = ref(null)

const getCircleSizeInPixels = () => {
    const size = props.diameterInMeters / props.metersPerPx
    return size + 220;
}
let chart = undefined

const id = `chart-${props.id}`

const drawChart = () => {
    chart?.destroy()
    chart = new Chart(document.getElementById(id), {
        type: 'pie',
        data: {
            labels: props.data.map((item) => item.label),
            datasets: [{
                label: props.title,
                data: props.data.map((item) => item.value),
                backgroundColor: props.data.map((item) => item.backgroundColor),
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
                // duration: 0
            },

            plugins: {
                legend: {
                    display: false
                },
            }
        }
    })
}

watch(props, () => {
    setTimeout(() => {
        drawChart()
    }, 100)
})

</script>

<template>
    <l-marker :lat-lng="props.latLng" :draggable="props.draggable" @update:lat-lng="position => circlePositionUpdated(position)">
        <l-icon :icon-size="[getCircleSizeInPixels(), getCircleSizeInPixels()]"
            :icon-anchor="[getCircleSizeInPixels() / 2, getCircleSizeInPixels() / 2]" class-name="someExtraClass">
            <div ref="container" class="chart-container">
                <canvas :id="id"></canvas>
            </div>
        </l-icon>
    </l-marker>
</template>

<style scoped></style>
```