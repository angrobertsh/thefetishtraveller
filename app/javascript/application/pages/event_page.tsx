import * as React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {EventWithLocation, canEdit, joinLocation} from '../models/event';
import {Like} from '../models/like';
import {locationDescription, extractCoordinates} from '../models/location';
import {DB, DBAction, writeDB, State} from '../state';
import {APISession} from '../api';
import Container from '../components/container';
import Hero from '../components/hero';
import LikeButton from '../components/like-button';
import Listing from '../components/listing';
import {Meta} from '../components/meta';
import {EventListing} from '../components/event_listing';
import {Map} from '../components/map';
import {dateRange} from '../util';
import {scoped} from '../i18n';

interface Props {
  event?: EventWithLocation;
  like?: Like;
  editable: boolean;
  dispatch: (DBAction) => void;
  otherEvents: EventWithLocation[];
}

const likes = writeDB.table('likes');

function format(text: string): any {
  return text.split("\n").map(e => <p>{e}</p>);
}

function link(url?: string) {
  return url ? <a href={url} target="_blank">{url.replace(/https?\:\/\/(www\.)?/, '').split('/')[0]}</a> : null;
}

const t = scoped('event');

class EventPage extends React.Component<Props> {
  render() {
    let {event, like, editable, otherEvents} = this.props;
    if(!event) { return null };
    const hero = event.hero && event.hero.big;
    const coordinates = extractCoordinates(event.location);
    const meta = [
      [t('.date'), dateRange(event.startAt, event.endAt)],
      [t('.location'), locationDescription(event.location)],
      [t('.website'), link(event.website)],
      [t('.organizer'), event.organizerName],
      [t('.tickets'), link(event.ticketLink)]
    ].filter(e => e[1]);
    return (
      <React.Fragment>
        <div className="spacer spacer--for-navbar"/>
        <Meta title={event.name}/>
        <Container variant="small">
          <h2>{event.name}</h2>
          {event.abstract && (<React.Fragment>
            <h4>{event.abstract}</h4>
            <div className="spacer--small"/>
          </React.Fragment>)}
          {hero && <p><img src={hero}/></p>}
          <div className={`meta-box meta-box--${hero && 'floating'}`}>
            {
              meta.map(e => (
                <p key={e[0] as string}>
                  <strong>{e[0]}</strong><br/>
                  {e[1]}
                </p>
              ))
            }
          </div>
          {event.description && format(event.description)}
          <h3>{locationDescription(event.location)}</h3>
          {coordinates && <Map center={coordinates}/>}
        </Container>
        {otherEvents.length && (
          <React.Fragment>
            <Container variant="small">
              <div className="spacer"/>
              <h2>{t('.other_events_in', {location: event.location.name})}</h2>
              <div/>
            </Container>
            <Listing>{otherEvents.map(e => <EventListing key={e.id} event={e} />)}</Listing>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: State, props) => {
  const slug: string = props.match.params.id;
  const db = new DB(state);
  const events = db.table('events');
  let event: EventWithLocation | null = joinLocation([events.where({slug})[0]], state)[0];
  let otherEvents: EventWithLocation[] = joinLocation(events.where({locationId: event.locationId}).filter(e => e.id != event!.id), state);
  const editable = canEdit(event, db.get('session'));
  const like = db.table('likes').where({eventId: event.id})[0]
  return {event, like, editable, otherEvents};
}

export default connect(mapStateToProps)(EventPage)
