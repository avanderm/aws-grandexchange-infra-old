#!/bin/bash
curl https://pyenv.run | bash

cat << EOF > ~/.bashrc
export PATH="~/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
EOF

source ~/.bashrc