import { ref, onMounted, onUnmounted } from 'vue'

export default function useHeadsUpSensor() {
    const headsUpNotify = ref(false) // 控制是否显示“请抬头看路”提示
    let steps = 0
    let lastAcceleration = { x: 0, y: 0, z: 0 }
    let lastTime = 0
    let stepWindow = []
    let headsUpHasShown = false
    const stepWindowDuration = 5000 // 步数检测窗口时长（5秒内）
    const angleThreshold = 30 // 角度阈值
    const buffer = 5 // 角度缓冲区
    const stepThreshold = 7 // 步数阈值

    // 平滑加速度数据的简单低通滤波器
    const lowPassFilter = (current, previous, alpha = 0.5) => {
        return {
            x: alpha * previous.x + (1 - alpha) * current.x,
            y: alpha * previous.y + (1 - alpha) * current.y,
            z: alpha * previous.z + (1 - alpha) * current.z
        }
    }

    // 显示提示
    const showHeadsUp = () => {
        // 检查 sessionStorage 是否已有提示记录
        if (headsUpHasShown) {
            return
        }
        headsUpNotify.value = true
        headsUpHasShown = true
    }

    // 隐藏提示
    const hideHeadsUp = () => {
        headsUpNotify.value = false
    }

    // 检查是否需要显示“请抬头看路”提示
    const checkForHeadsUp = (yAngle) => {
        const currentTime = Date.now()

        // 移除超过时间窗口的步数
        stepWindow = stepWindow.filter(time => currentTime - time <= stepWindowDuration)

        // 如果设备角度低于30度的缓冲区内，并且在指定时间窗口内步数达到阈值，则显示提示
        if (Math.abs(yAngle) < angleThreshold + buffer && stepWindow.length >= stepThreshold) {
            showHeadsUp()
        }
    }

    // 监听设备方向的回调函数
    const onDeviceOrientation = (event) => {
        const y = event.beta // 获取y轴的角度，范围是-180到180度
        checkForHeadsUp(y)
    }

    // 监听设备运动的回调函数
    const onDeviceMotion = (event) => {
        const currentTime = Date.now()
        const acceleration = event.accelerationIncludingGravity

        // 平滑处理加速度
        const smoothedAcceleration = lowPassFilter(acceleration, lastAcceleration)

        const diffX = smoothedAcceleration.x - lastAcceleration.x
        const diffY = smoothedAcceleration.y - lastAcceleration.y
        const diffZ = smoothedAcceleration.z - lastAcceleration.z
        const magnitude = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ)

        // 检测步伐变化：通过加速度峰值来识别
        if (magnitude > 1.5 && currentTime - lastTime > 300) {
            steps += 1
            stepWindow.push(currentTime) // 记录步伐的时间
            lastTime = currentTime
        }

        // 更新上一次加速度
        lastAcceleration = smoothedAcceleration
    }

    // 启动传感器监听
    const startSensors = () => {
        steps = 0
        window.addEventListener('deviceorientation', onDeviceOrientation)
        window.addEventListener('devicemotion', onDeviceMotion)
    }

    // 停止传感器监听
    const stopSensors = () => {
        window.removeEventListener('deviceorientation', onDeviceOrientation)
        window.removeEventListener('devicemotion', onDeviceMotion)
    }

    // 启动和停止传感器监听的生命周期控制
    onMounted(() => {
        const storedHeadsUpNotify = localStorage.getItem('stored_data_setting_headsUpNotify')
        // 如果不存在，设置默认值为 true
        if (storedHeadsUpNotify === null) {
            localStorage.setItem('stored_data_setting_headsUpNotify', 'true')
            startSensors() // 启动传感器检测
        } else {
            const notifySetting = JSON.parse(storedHeadsUpNotify)
            if (notifySetting) {
                startSensors() // 启动传感器检测
            } else {
                stopSensors()
            }
        }
    })
    onUnmounted(() => {
        stopSensors()
    })

    return {
        headsUpNotify, // 返回是否显示提示的状态
        hideHeadsUp   // 提供隐藏提示的功能
    }
}
