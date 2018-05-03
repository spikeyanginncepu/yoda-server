

# init user data
mkdir -p data/admin

# init ssh keygen
./mkcert.sh

#init postgresql
echo "create user yoda" | sudo sudo -u postgres psql
echo "alter user yoda with password '`cat ssl/password2.txt`'" | sudo sudo -u postgres psql
echo "CREATE DATABASE yoda OWNER yoda;" | sudo -u postgres psql -f initdb.sql
echo "GRANT ALL PRIVILEGES ON DATABASE yoda to yoda;" | sudo -u postgres psql -f initdb.sql
sudo -u postgres psql yoda -f initdb.sql
sudo -u postgres psql yoda -f conf/models.sql
