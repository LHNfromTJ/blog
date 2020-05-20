module.exports = {
    title: '面试知识点总结',
    themeConfig: {
        nav: [
            {
                text: '目录',
                items: [
                    {
                        text: 'JavaScript',
                        items: [
                            {
                                text: 'Event Loops',
                                link: '/JavaScript/EventLoops/'
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
