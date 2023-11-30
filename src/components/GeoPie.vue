<script setup>
import Chart from 'chart.js/auto';
import { LatLng, Map, Point, map } from "leaflet";
import { computed, defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Lmap from "leaflet"
import { nextTick } from 'vue';
import { onUnmounted } from 'vue';


const props = defineProps({
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
        required: false
    },
    /**
     * Title of the pie
     * e.g. the name of the neighborhood
     */
    title: {
        type: String,
        required: false
    },
    /**
     * A link to the parent map
     * @type {Lmap}
     */
    parentMap: {
        type: Map,
        required: true,
    },
    /**
     * Whether the pie should be displayed on top of other elements
     */
    showOnTop: {
        type: Boolean,
        required: false,
    },
})

const { t } = useI18n()

/**
 * Whether the parent map is zooming or not
 */
const parentMapIsZooming = ref(false)

/**
 * Computes the size of the pie in pixels, plus the padding, based on the zoom level of the map
 * @see https://gis.stackexchange.com/questions/7430/what-ratio-scales-do-google-maps-zoom-levels-correspond-to
 * @returns {number}
 */
const getCircleSizeInPixels = () => {
    const metersPerPx = 156543.03392 * Math.cos(props.latLng[0] * Math.PI / 180) / Math.pow(2, props.parentMap.getZoom())
    const size = Math.round(props.diameterInMeters / metersPerPx)
    return size + 330;
}
/**
 * Current circle size in pixels
 */
const circleSizeInPixels = ref(getCircleSizeInPixels())


const pie = ref(null)
/**
 * Draws the pie chart
 */
const drawChart = () => {
    const dest = pie.value.getContext('2d')


    const chart = new Chart(dest, {
        type: 'pie',
        data: {
            labels: props.data.map((item) => t(item.label)),
            datasets: [{
                label: props.title,
                data: props.data.map((item) => item.value),
                backgroundColor: props.data.map((item) => item.backgroundColor),
                borderColor: '#00000',
                borderWidth: 0.5,
            }],
        },
        options: {
            tooltipTemplate: "<%= value %> Files",
            rotation: 180,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {

                    callbacks: {
                        title: (items) => {
                            return items[0].dataset.label
                        },
                        label: (item) => {
                            return `${item.label}: ${item.formattedValue} %`
                        }
                    },
                }
            },
            animation: {
                duration: 0
            },
            layout: {
                padding: 165
            },
        }
    });

    // props.parentMap.on("click", (e) => {
    //     console.log("parent map click")
    //     console.log(chart.getElementsAtEventForMode(e.originalEvent, "nearest", { intersect: true }, true))
    // })
}

const position = ref(
    props.parentMap.latLngToContainerPoint(props.latLng)
)

const chartContainer = ref(null)

const onZoomStart = () => parentMapIsZooming.value = true
const onZoomEnd = () => {
    circleSizeInPixels.value = getCircleSizeInPixels()
    parentMapIsZooming.value = false
}
const onMove = () => {
    position.value = props.parentMap.latLngToContainerPoint(props.latLng)
}

onMounted(() => {
    props.parentMap.on("zoomstart", onZoomStart)
    props.parentMap.on("zoomend", onZoomEnd)
    drawChart()
    props.parentMap.on("move", onMove)
})

onUnmounted(() => {
    props.parentMap.off("zoomstart", onZoomStart)
    props.parentMap.off("zoomend", onZoomEnd)
    props.parentMap.off("move", onMove)

})

</script>

<template>
    <div class="chart-container" ref="chartContainer" :style="{
        width: circleSizeInPixels + 'px',
        height: circleSizeInPixels + 'px',
        top: position.y - circleSizeInPixels / 2 + 'px',
        left: position.x - circleSizeInPixels / 2 + 'px',
    }" :class="{ 'show-on-top': showOnTop, 'faded-out': parentMapIsZooming }">
        <canvas ref="pie"></canvas>
    </div>
</template>

<style scoped>
.chart-container {
    position: absolute;
    z-index: 1000;
    transition-delay: 0.5s;
    transition: opacity 0.5s;
    opacity: 1;
}


.chart-container.show-on-top {
    z-index: 1001;
}

.chart-container.faded-out {
    transition: opacity 0s;
    transition-delay: 0s;
    opacity: 0;
}
</style>
```