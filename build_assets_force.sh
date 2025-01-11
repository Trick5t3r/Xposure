source env/bin/activate
pip freeze > backend/requirements.txt
sudo docker-compose up --build