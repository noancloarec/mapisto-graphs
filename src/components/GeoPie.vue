<template>
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
</template>