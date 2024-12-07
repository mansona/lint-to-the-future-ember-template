import RouteTemplate from 'ember-route-template';

export default RouteTemplate(<template>
  {{!-- template-lint-disable no-log --}}
  Hello from typescript! {{log "I guess"}}
</template>);
