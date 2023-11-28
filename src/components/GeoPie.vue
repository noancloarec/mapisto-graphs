<script setup>
import { LIcon, LMarker } from "@vue-leaflet/vue-leaflet";
import Chart from 'chart.js/auto';
import { LatLng } from "leaflet";
import { defineEmits, defineProps,  watch, computed } from 'vue';


const props = defineProps({
    /**
     * Identifier for the pie, for technical purposes
     */
    id: {
        type: [String, Number],
        required: true
    },
    /**
     * Latitude and longitude of the center of the pie
     */
    latLng: {
        type: [LatLng, Array],
        required: true
    },
    /**
     * Diameter of the pie in meters.
     * The pie will be resized according to the zoom level of the map
     */
    diameterInMeters: {
        type: Number,
        required: true
    },
    /**
     * Pie data in the format [{label: string, value: number, backgroundColor: string}]
     */
    data: {
        type: Array,
        required: true
    },
    /**
     * Title of the pie
     * e.g. the name of the neighborhood
     */
    title: {
        type: String,
        required: true
    },
    /**
     * Zoom level of the containing map
     */
    zoomLevel: {
        type: Number,
        required: true
    },
    /**
     * Whether the pie can be dragged by the user
     */
    draggable: {
        type: Boolean,
        required: true
    },
    /**
     * Z index offset of the pie.
     * Useful to make the canvas appear on top of potential overlapping canvases
     */
    zIndexOffset: {
        type: Number,
        required: true
    }
})

/**
 * Event emitted when the user drags the pie
 */
defineEmits(['onPositionUpdated'])

/**
 * Computes the size of the pie in pixels, based on the zoom level of the map
 * @see https://gis.stackexchange.com/questions/7430/what-ratio-scales-do-google-maps-zoom-levels-correspond-to
 * @returns 
 */

/**
 * Current circle size in pixels
 */
const circleSizeInPixels = computed(() => {
    const metersPerPx = 156543.03392 * Math.cos(props.latLng[0] * Math.PI / 180) / Math.pow(2, props.zoomLevel)
    const size = props.diameterInMeters / metersPerPx
    return size + 220;
})


let chart = undefined
/**
 * Draws the pie chart
 */
const drawChart = () => {
    chart?.destroy()
    chart = new Chart(document.getElementById(props.id), {
        type: 'pie',
        data: {
            labels: props.data.map((item) => item.label),
            datasets: [{
                label: props.title,
                data: props.data.map((item) => item.value),
                backgroundColor: props.data.map((item) => item.backgroundColor),
                borderColor: '#00000',
                borderWidth: 0.5,
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
    })
}

/**
 * Redraws the pie when props are updated to match the new zoom level
 * We should not have to do that but vue-leaflet destroys the canvas whenever props change
 */
watch(props, () => scheduleChartRedraw(1000))

/**
 * Schedules a chart redraw
 * @param {number} time to wait before redrawing the chart in milliseconds
 */
const scheduleChartRedraw = (ms) => {
    setTimeout(() => {
        drawChart()
    }, ms ? 100 : ms)
}
</script>

<template>
    <l-marker :z-index-offset="props.zIndexOffset" :lat-lng="props.latLng" :draggable="props.draggable"
        @update:lat-lng="$emit(onPositionUpdated($event))" >
        <l-icon :icon-size="[circleSizeInPixels, circleSizeInPixels]"
            :icon-anchor="[circleSizeInPixels / 2, circleSizeInPixels / 2]" class-name="someExtraClass"
            @ready="scheduleChartRedraw"
            >
            <div class="chart-container">
                <canvas :id="id"></canvas>
            </div>
        </l-icon>
    </l-marker>
</template>

<style scoped></style>
```