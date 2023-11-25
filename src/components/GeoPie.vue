<script setup>
import { LIcon, LMarker } from "@vue-leaflet/vue-leaflet";
import Chart from 'chart.js/auto';
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

onMounted(() => {
    console.log("mounted")
    setTimeout(() => {
        drawChart()
    }, 1000)
})

const props = defineProps(['id', 'lat-lng', 'diameter-in-meters', 'data', 'title', 'zoom-level', 'draggable', 'z-index-offset'])
const emit = defineEmits(['on-position-updated'])

const circlePositionUpdated = (newPosition) => {
    console.log("circlePositionUpdated")
    emit('on-position-updated', newPosition)
}
const container = ref(null)

const getCircleSizeInPixels = () => {
    const metersPerPx = 156543.03392 * Math.cos(props.latLng[0] * Math.PI / 180) / Math.pow(2, props.zoomLevel)
    const size = props.diameterInMeters / metersPerPx
    return size + 220;
}
let chart = undefined

const id = `chart-${props.id}`

const drawChart = (zoomChanged) => {
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
            animation: zoomChanged ? {} : {
                duration: 0
            },

            plugins: {
                legend: {
                    display: false
                },
            }
        }
    })
}
let zoomLevel = props.zoomLevel
console.log("redraw")
watch(props, (newVal) => {
    const zoomChanged = newVal.zoomLevel !== zoomLevel
    setTimeout(() => {
        drawChart(zoomChanged)
    }, 10)
    zoomLevel = newVal.zoomLevel

})
const chim = ref(null)
const scheduleChartRedraw = () => {
    console.log("scheduleChartRedraw")
    console.log(chim.value)
    const leafletObject = chim.value.leafletObject
    console.log(leafletObject)
    setTimeout(() => {
        drawChart()
    }, 100)
}


</script>

<template>
    <l-marker ref="chim" :z-index-offset="props.zIndexOffset" :lat-lng="props.latLng" :draggable="props.draggable"
        @update:lat-lng="position => circlePositionUpdated(position)" @ready="scheduleChartRedraw">
        <l-icon :icon-size="[getCircleSizeInPixels(), getCircleSizeInPixels()]"
            :icon-anchor="[getCircleSizeInPixels() / 2, getCircleSizeInPixels() / 2]" class-name="someExtraClass"
            @ready="scheduleChartRedraw">
            <div ref="container" class="chart-container">
                <canvas :id="id"></canvas>
            </div>
        </l-icon>
    </l-marker>
</template>

<style scoped></style>
```