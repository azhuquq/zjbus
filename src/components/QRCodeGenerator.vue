<template>
    <div>
        <img :src="qrCodeUrl" alt="QR Code" style="width: 100%; height: 100%; max-height: 240px; max-width: 240px;" />
    </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
    name: 'QRCodeGenerator',
    props: {
        text: {
            type: String,
            required: true,
        },
        errorCorrectionLevel: {
            type: String,
            default: 'M'
        },
        darkColor: {
            type: String,
            default: '#000000FF'
        },
        lightColor: {
            type: String,
            default: '#FFFFFFFF'
        },
        version: {
            type: Number,
            default: undefined
        }
    },
    data() {
        return {
            qrCodeUrl: ''
        }
    },
    mounted() {
        this.generateQRCode()
    },
    unmounted() {
        this.qrCodeUrl = ''
    },
    watch: {
        text(newVal) {
            console.log("🚩 ~ text ~ newVal 👇\n", newVal)
            if (newVal) {
                this.generateQRCode()
            }
        }
    },
    methods: {
        generateQRCode() {
            QRCode.toDataURL(this.text, {
                errorCorrectionLevel: this.errorCorrectionLevel,
                color: {
                    dark: this.darkColor,
                    light: this.lightColor
                },
                version: this.version,
                margin: 1,
                scale: 10
            }, (error, url) => {
                if (error) console.error(error)
                this.qrCodeUrl = url
                console.log('QR code generated successfully!')
            })
        }
    }
}
</script>   