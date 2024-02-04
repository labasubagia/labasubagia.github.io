FROM node:alpine

ARG USER=node
# node has UID=1000, GID=1000

RUN apk add -q --update openssh-client git zsh starship shadow sudo
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN chsh -s $(which zsh) $USER && \
    mkdir -p /etc/sudoers.d && \
    echo $USER ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USER && \
    chmod 0440 /etc/sudoers.d/$USER

USER $USER
RUN pnpm config set store-dir /home/$USER/.pnpm-store
RUN echo "eval \"$(starship init zsh)\"" >> /home/$USER/.zshrc
