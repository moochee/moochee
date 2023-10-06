#!/bin/sh -e

echo 'Local stage'
npm ci
npm run lint
npm test

echo 'Production stage'
instance_id=$(git rev-list --count HEAD)
new_app_name=app-${instance_id}

alias dokku='ssh -t dokku@moochee.us'

echo "Discover the old app name"
old_app_name=$(dokku apps:list | grep -Eo -m 1 'app-[0-9]+')
echo the old app name is: ${old_app_name}

echo "Deploy new version"
if dokku apps:exists ${new_app_name}; then
    dokku apps:destroy ${new_app_name} --force
fi
dokku apps:create ${new_app_name}
dokku storage:mount ${new_app_name} /var/lib/dokku/data/storage/moochee/quiz:/quiz
dokku storage:mount ${new_app_name} /var/lib/dokku/data/storage/moochee/history:/history
dokku certs:add ${new_app_name} /home/dokku/server.crt /home/dokku/server.key
dokku proxy:ports-set ${new_app_name} http:80:8080 https:443:8080
dokku nginx:set ${new_app_name} proxy-read-timeout 180m

git remote add dokku dokku@moochee.us:${new_app_name} || git remote set-url dokku dokku@moochee.us:${new_app_name}
dokku config:set --no-restart ${new_app_name} \
    CLIENT_ID=$CLIENT_ID \
    CLIENT_SECRET=$CLIENT_SECRET \
    SESSION_SECRET=$SESSION_SECRET \
    QUIZZES_DIR=/quiz \
    HISTORY_DIR=/history \
    DEDICATED_ORIGIN=https://app.moochee.us \
    STRIPE_API_KEY=$STRIPE_API_KEY \
    STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
git push dokku main

echo "Switch public route from old app to new app"
# dokku domains:remove ${old_app_name} app.moochee.us
dokku domains:add ${new_app_name} app.moochee.us

echo "Clean up" 
# dokku apps:destroy ${old_app_name} --force
dokku domains:remove ${new_app_name} ${new_app_name}.moochee.us
