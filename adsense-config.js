/* DinkSense AdSense configuration
   Leave enabled=false until Google approves the site and supplies a publisher/client ID
   and responsive ad-unit slot IDs. Restrict ads to the designated non-core placements. */
window.DINKSENSE_ADSENSE = {
  enabled: false,
  client: 'ca-pub-REPLACE_WITH_YOUR_PUBLISHER_ID',
  slots: {
    content: 'REPLACE_WITH_RESPONSIVE_SLOT_ID',
    home: 'REPLACE_WITH_HOME_SLOT_ID',
    discover: 'REPLACE_WITH_DISCOVER_SLOT_ID',
    learn: 'REPLACE_WITH_PLAYBOOK_SLOT_ID',
    gear: 'REPLACE_WITH_GEAR_SLOT_ID',
    compete: 'REPLACE_WITH_COMPETE_SLOT_ID'
  }
};
