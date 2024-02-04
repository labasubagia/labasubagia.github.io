FROM node:alpine

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN apk add -q --update openssh-client git zsh starship shadow sudo
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN chsh -s $(which zsh) $USERNAME && \
    mkdir -p /etc/sudoers.d && \
    echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
    chmod 0440 /etc/sudoers.d/$USERNAME
RUN groupmod --gid $USER_GID $USERNAME \
    && usermod --uid $USER_UID --gid $USER_GID $USERNAME \
    && chown -R $USER_UID:$USER_GID /home/$USERNAME

USER $USERNAME
RUN pnpm config set store-dir /home/$USERNAME/.pnpm-store
RUN echo "eval \"$(starship init zsh)\"" >> /home/$USERNAME/.zshrc
