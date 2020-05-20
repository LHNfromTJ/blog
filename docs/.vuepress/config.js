module.exports = {
    title: '面试知识点总结',
    themeConfig: {
        nav: [
            {
                text: '目录',
                link: '/Home/',
                items: [
                    {
                        text: 'JavaScript',
                        items: [
                            {
                                text: 'Event Loop',
                                link: '/JavaScript/EventLoop/'
                            }
                        ],
                    }
                ],
            },
        ],
        sidebar: 'auto',
        sidebarDepth: 2,
    },
    markdown: {
        lineNumbers: true,
    },
    head: [
        ['link', {
            rel: 'icon',
            ref: '/icon.png',
        }],
    ],
};
