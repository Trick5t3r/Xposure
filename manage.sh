#!/bin/bash

# Emplacements des répertoires backend et frontend
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

# Ports par défaut
BACKEND_PORT=8000
FRONTEND_PORT=5173

# Fichiers PID pour suivre les processus
BACKEND_PID_FILE="/tmp/backend_server.pid"
FRONTEND_PID_FILE="/tmp/frontend_server.pid"

# Fonction pour démarrer les serveurs
start() {
    echo "Démarrage des serveurs..."

    # Lancer le backend
    if [ -d "$BACKEND_DIR" ]; then
        source env/bin/activate
        cd "$BACKEND_DIR"
        python manage.py runserver 0.0.0.0:$BACKEND_PORT &> /dev/null &
        BACKEND_PID=$!
        echo $BACKEND_PID > "$BACKEND_PID_FILE"
        echo "Backend lancé sur http://127.0.0.1:$BACKEND_PORT (PID: $BACKEND_PID)"
        cd - &> /dev/null
    else
        echo "Répertoire backend introuvable : $BACKEND_DIR"
    fi

    # Lancer le frontend
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        npm run dev &> /dev/null &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
        echo "Frontend lancé sur http://127.0.0.1:$FRONTEND_PORT (PID: $FRONTEND_PID)"
        cd - &> /dev/null
    else
        echo "Répertoire frontend introuvable : $FRONTEND_DIR"
    fi
}

# Fonction pour arrêter les serveurs
stop() {
    # Arrêter le backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$BACKEND_PID" &> /dev/null; then
            kill "$BACKEND_PID"
            echo "Backend stopped (PID: $BACKEND_PID)"
        fi
        rm -f "$BACKEND_PID_FILE"
    else
        echo "No backend process."
    fi

    # Arrêter le frontend
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$FRONTEND_PID" &> /dev/null; then
            kill "$FRONTEND_PID"
            echo "Frontend stopped (PID: $FRONTEND_PID)"
        fi
        rm -f "$FRONTEND_PID_FILE"
    

        # Trouver et arrêter les processus Vite et Esbuild
        VITE_PROCESSES=$(ps aux | grep "$FRONTEND_DIR/node_modules/.bin/vite" | grep -v "grep" | awk '{print $2}')
        ESBUILD_PROCESSES=$(ps aux | grep "$FRONTEND_DIR/node_modules/@esbuild/linux-x64/bin/esbuild" | grep -v "grep" | awk '{print $2}')

        if [ -n "$VITE_PROCESSES" ]; then
            echo "$VITE_PROCESSES" | xargs kill -9
            echo "Processus Vite stopped."
        fi

        if [ -n "$ESBUILD_PROCESSES" ]; then
            echo "$ESBUILD_PROCESSES" | xargs kill -9
            echo "Processus Esbuild stopped."
        fi
    else
        echo "No frontend process found."
    fi
}

# Vérifier l'argument fourni
if [ "$1" == "start" ]; then
    start
elif [ "$1" == "stop" ]; then
    stop
else
    echo "Usage: $0 {start|stop}"
    exit 1
fi
