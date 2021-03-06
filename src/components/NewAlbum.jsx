import styles from '../styles/newAlbum'

import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { translate } from 'cozy-ui/react/I18n'
import { fetchIfNeededPhotos, fetchMorePhotos, getTimelineList, getPhotosByMonth } from '../ducks/timeline'
import { createAlbum } from '../ducks/albums'
import PhotoBoard from './PhotoBoard'
import Alerter from './Alerter'

class NewAlbum extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: [],
      name: props.t('Albums.create.panel_form.placeholder')
    }
  }

  onPhotoToggle = obj => {
    this.setState(({ selected }) => {
      const idx = selected.findIndex(i => i === obj.id)
      return {
        selected: idx === -1
          ? [...selected, obj.id]
          : [...selected.slice(0, idx), ...selected.slice(idx + 1)]
      }
    })
  }

  onPhotosSelect = ids => {
    this.setState(({ selected }) => {
      const newIds = ids.filter(id => selected.indexOf(id) === -1)
      return {
        selected: [...selected, ...newIds]
      }
    })
  }

  onPhotosUnselect = ids => {
    this.setState(({ selected }) => {
      return {
        selected: selected.filter(id => ids.indexOf(id) === -1)
      }
    })
  }

  onNameChange = e => {
    this.setState({ name: e.target.value })
  }

  onSubmit = e => {
    const { name, selected } = this.state
    this.props.createAlbum(name, selected)
  }

  componentDidMount () {
    this.props.fetchIfNeededPhotos()
    this.input.focus()
    this.input.select()
  }

  render () {
    const { t, closeAddAlbum } = this.props
    const { name } = this.state
    return (
      <div className={styles['pho-panel']}>
        <div className={styles['pho-panel-form']}>
          <header className={styles['pho-panel-header']}>
            <div className={styles['pho-panel-wrap']}>
              <label className={styles['coz-form-label']}>{t('Albums.create.panel_form.label')}</label>
              <input
                type='text'
                ref={input => { this.input = input }}
                value={name}
                onChange={this.onNameChange}
              />
            </div>
          </header>
          <div className={styles['pho-panel-content']}>
            <div className={styles['pho-panel-wrap']}>
              {this.renderBoard()}
            </div>
          </div>
          <footer className={styles['pho-panel-footer']}>
            <div className={styles['pho-panel-wrap']}>
              <div className={styles['pho-panel-controls']}>
                <button className={classNames('coz-btn', 'coz-btn--secondary')} onclick={closeAddAlbum}>
                  {t('Albums.create.panel_form.cancel')}
                </button>
                <button
                  className={classNames('coz-btn', 'coz-btn--regular')}
                  onClick={this.onSubmit}
                >
                  {t('Albums.create.panel_form.submit')}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    )
  }

  renderBoard () {
    const { f, list, fetchMorePhotos } = this.props
    if (!list) {
      return null
    }
    const photoLists = getPhotosByMonth(list.entries, f, 'MMMM YYYY')
    return (
      <PhotoBoard
        lists={photoLists}
        selected={this.state.selected}
        photosContext='albums'
        showSelection
        onPhotoToggle={this.onPhotoToggle}
        onPhotosSelect={this.onPhotosSelect}
        onPhotosUnselect={this.onPhotosUnselect}
        fetchStatus={list.fetchStatus}
        hasMore={list.hasMore}
        onFetchMore={() => fetchMorePhotos(list.index, list.entries.length)}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  list: getTimelineList(state)
})

export const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchIfNeededPhotos: () => dispatch(fetchIfNeededPhotos()),
  fetchMorePhotos: (index, skip) => dispatch(fetchMorePhotos(index, skip)),
  createAlbum: (name, photos) =>
    dispatch(createAlbum(name, photos))
      .then(() => {
        ownProps.closeAddAlbum()
        Alerter.success('Albums.create.success', {name: name, smart_count: photos.length})
      })
      .catch(error => Alerter.error(error.message, error.messageData))
})

export default withRouter(translate()(connect(
  mapStateToProps,
  mapDispatchToProps
)(NewAlbum)))
