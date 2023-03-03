import { ElNotification } from 'element-plus'

export const toastError = (title, message) => {
    ElNotification({
        customClass: 'top-of-every-thing',
        type: 'warning',
        title: title,
        message: message,
        duration: 15 * 1000,
    })
}