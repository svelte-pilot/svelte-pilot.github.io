import antfu from '@antfu/eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'

export default antfu(
  {
    formatters: true,
    rules: {
      ...perfectionist.configs['recommended-natural'].rules,
      'prefer-const': 'off',
    },
    svelte: true,
    unocss: true,
  },
)
