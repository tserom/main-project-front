# 单域名：配合 infra/gateway 与 hosts/DNS 中的 k-project.com
# 构建父应用镜像时可将本文件内容用于 build-arg，或复制为 .env.production 后 pnpm build
#
# 无界 entry 使用同源相对路径（浏览器当前域名为 k-project.com）
VITE_HELLO_FRONT_URL=/micro/hello/
VITE_USER_FRONT_URL=/micro/user/
