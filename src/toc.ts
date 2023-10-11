export default {
  en: [
    {
      chapter: 'Guide',
      sections: [
        {
          slug: 'introduction',
          file: () => import('../.html/en/introduction.html?raw'),
          title: 'Introduction'
        },
        {
          slug: 'creating-a-project',
          file: () => import('../.html/en/creating-a-project.html?raw'),
          title: 'Creating a Project'
        },
        {
          slug: 'routing',
          file: () => import('../.html/en/routing.html?raw'),
          title: 'Routing'
        },
        {
          slug: 'ssr',
          file: () => import('../.html/en/ssr.html?raw'),
          title: 'Server-Side Rendering'
        }
      ]
    },
    {
      chapter: 'Reference',
      sections: [
        {
          slug: 'router',
          file: () => import('../.html/en/router.html?raw'),
          title: 'Router Class'
        },
        {
          slug: 'link',
          file: () => import('../.html/en/link.html?raw'),
          title: '<Link> Component'
        }
      ]
    }
  ],

  zh: [
    {
      chapter: '指南',
      sections: [
        {
          slug: 'introduction',
          file: () => import('../.html/zh/introduction.html?raw'),
          title: '介绍'
        },
        {
          slug: 'creating-a-project',
          file: () => import('../.html/zh/creating-a-project.html?raw'),
          title: '新建一个项目'
        },
        {
          slug: 'routing',
          file: () => import('../.html/zh/routing.html?raw'),
          title: '路由配置'
        },
        {
          slug: 'ssr',
          file: () => import('../.html/zh/ssr.html?raw'),
          title: '服务端渲染'
        }
      ]
    },
    {
      chapter: '参考',
      sections: [
        {
          slug: 'router',
          file: () => import('../.html/zh/router.html?raw'),
          title: 'Router 类'
        },
        {
          slug: 'link',
          file: () => import('../.html/zh/link.html?raw'),
          title: '<Link> 组件'
        }
      ]
    }
  ]
}
