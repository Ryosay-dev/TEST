const {
    createApp,
    ref,
    computed,
} = Vue

createApp({
    setup() {

        const formData = ref({
            comment_enable: true,
            comment_strokeColor: '#000000',
            comment_fontColor: '#ffffff',

            gift_enable: true,
            gift_bgColor: '#ffdddd',
            gift_fontColor: '#ff3d3d',

            follow_enable: true,
            follow_bgColor: '#8acaff',
            follow_fontColor: '#19588b',

            like_enable: true,
            like_bgColor: '#c08414',
            like_fontColor: '#ffffff',
        })

        const sectionList = ref([
            {
                name: 'コメント',
                key: 'comment',
                colorInfo: {
                    strokeColor: '枠線',
                    fontColor: '文字色',
                }
            },
            {
                name: 'ギフト',
                key: 'gift',
                colorInfo: {
                    bgColor: '背景色',
                    fontColor: '文字色',
                }
            },
            {
                name: 'フォロー',
                key: 'follow',
                colorInfo: {
                    bgColor: '背景色',
                    fontColor: '文字色',
                }
            },
            {
                name: 'いいね',
                key: 'like',
                colorInfo: {
                    bgColor: '背景色',
                    fontColor: '文字色',
                }
            }
        ])

        const link = computed(() => {
            // const url = new URL(window.location.href)
            // url.searchParams.set('data', JSON.stringify(formData.value));
            // return url.toString()
            const url = new URL(window.location.href.replace('setting', 'overlay'))
            for (const key of Object.keys(formData.value)) {
                url.searchParams.set(key, formData.value[key]);
            }
            return url.toString()
        })

        return {
            formData,
            sectionList,
            link,
        }
    }
}).mount('#app')